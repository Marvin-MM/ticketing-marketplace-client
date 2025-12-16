"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { bookingsApi } from "@/lib/api/bookings"
import { queryKeys } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Ticket, CreditCard, Download, XCircle, CheckCircle2 } from "lucide-react"
import { formatCurrency, formatDateTime, formatBookingRef } from "@/lib/utils/format"
import type { BookingStatus } from "@/lib/types"

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: booking, isLoading } = useQuery({
    queryKey: queryKeys.bookings.detail(params.id as string),
    queryFn: () => bookingsApi.getBookingById(params.id as string),
    enabled: !!params.id,
  })

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancelBooking(params.id as string, "User requested cancellation"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.myBookings() })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(params.id as string) })
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      })
    },
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Booking not found</h3>
          <p className="text-muted-foreground">The booking you're looking for doesn't exist</p>
        </div>
      </Card>
    )
  }

  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED"

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
                <Badge variant="outline" className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">Reference: {formatBookingRef(booking.bookingRef)}</p>
            </div>
            <div className="flex gap-2">
              {booking.status === "CONFIRMED" && (
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download tickets
                </Button>
              )}
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel booking
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this booking? This action cannot be undone. You may be eligible
                        for a refund based on the cancellation policy.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep booking</AlertDialogCancel>
                      <AlertDialogAction onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
                        {cancelMutation.isPending ? "Cancelling..." : "Cancel booking"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
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
                <div className="flex-1">
                  <h3 className="font-semibold text-xl mb-2">{booking.campaign.title}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(booking.campaign.eventDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {booking.campaign.venue}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking details */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ticket Type</div>
                  <div className="font-medium capitalize">{booking.ticketType}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Quantity</div>
                  <div className="font-medium">{booking.quantity} ticket(s)</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Issuance Type</div>
                  <div className="font-medium">
                    {booking.issuanceType === "SINGLE" ? "Single ticket" : "Separate tickets"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                  <div className="font-medium text-lg">{formatCurrency(booking.totalAmount)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment information */}
          {booking.payment && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Payment Status</div>
                    <Badge
                      variant="outline"
                      className={booking.payment.status === "SUCCESS" ? "bg-green-500/10 text-green-500" : ""}
                    >
                      {booking.payment.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Amount Paid</div>
                    <div className="font-medium">{formatCurrency(booking.payment.amount)}</div>
                  </div>
                  {booking.payment.reference && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Transaction Reference</div>
                      <div className="font-mono text-sm">{booking.payment.reference}</div>
                    </div>
                  )}
                  {booking.payment.paymentMethod && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Payment Method</div>
                      <div className="font-medium">{booking.payment.paymentMethod}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tickets */}
          {booking.tickets && booking.tickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="relative h-24 w-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={ticket.qrCode || "/placeholder.svg"}
                          alt={`Ticket ${ticket.ticketNumber}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-mono font-semibold">{ticket.ticketNumber}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Status: <Badge variant="outline">{ticket.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Scans: {ticket.scanCount} / {ticket.maxScans}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-primary p-2">
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="w-px h-full bg-border mt-2" />
                  </div>
                  <div className="pb-4">
                    <div className="font-medium">Booking created</div>
                    <div className="text-sm text-muted-foreground">{formatDateTime(booking.createdAt)}</div>
                  </div>
                </div>

                {booking.payment && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`rounded-full p-2 ${booking.payment.status === "SUCCESS" ? "bg-primary" : "bg-muted"}`}
                      >
                        <CreditCard
                          className={`h-4 w-4 ${booking.payment.status === "SUCCESS" ? "text-primary-foreground" : "text-muted-foreground"}`}
                        />
                      </div>
                      {booking.status === "CONFIRMED" && <div className="w-px h-full bg-border mt-2" />}
                    </div>
                    <div className="pb-4">
                      <div className="font-medium">
                        Payment {booking.payment.status === "SUCCESS" ? "completed" : "pending"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.payment.status === "SUCCESS" ? "Payment successful" : "Awaiting payment"}
                      </div>
                    </div>
                  </div>
                )}

                {booking.status === "CONFIRMED" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-primary p-2">
                        <Ticket className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Tickets issued</div>
                      <div className="text-sm text-muted-foreground">Ready to use</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                If you have any questions about your booking, please contact support.
              </p>
              <Button variant="outline" className="w-full bg-transparent">
                Contact support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
