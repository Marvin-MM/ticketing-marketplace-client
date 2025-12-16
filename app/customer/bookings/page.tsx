"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { bookingsApi } from "@/lib/api/bookings"
import { queryKeys } from "@/lib/queryClient"
import { Calendar, MapPin, Ticket, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate, formatBookingRef } from "@/lib/utils/format"
import type { BookingStatus } from "@/lib/types"

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"all" | BookingStatus>("all")

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.bookings.myBookings({ status: activeTab === "all" ? undefined : activeTab }),
    queryFn: () => bookingsApi.getMyBookings({ status: activeTab === "all" ? undefined : activeTab }),
  })

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "EXPIRED":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground mt-2">View and manage your event bookings</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-24 w-24 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data && data.bookings.length > 0 ? (
            <div className="space-y-4">
              {data.bookings.map((booking) => (
                <Card key={booking.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Event image */}
                      <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={
                            booking.campaign.coverImage ||
                            `/placeholder.svg?height=96&width=96&query=${booking.campaign.title}`
                          }
                          alt={booking.campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Booking details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.campaign.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Booking ref: {formatBookingRef(booking.bookingRef)}
                            </p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(booking.campaign.eventDate, "PPP")}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.campaign.venue}
                          </div>
                          <div className="flex items-center gap-1">
                            <Ticket className="h-4 w-4" />
                            {booking.quantity} ticket(s) • {booking.ticketType}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="font-semibold text-lg">{formatCurrency(booking.totalAmount)}</div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/customer/bookings/${booking.id}`}>
                              View details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center space-y-2">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">No bookings found</h3>
                <p className="text-muted-foreground">You haven't made any bookings yet</p>
                <Button asChild className="mt-4">
                  <Link href="/customer/events">Explore events</Link>
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
