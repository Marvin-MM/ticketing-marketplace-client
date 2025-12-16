"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Ticket,
  Calendar,
  MapPin,
  MoreVertical,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { campaignsApi } from "@/lib/api/campaigns"
import { bookingsApi } from "@/lib/api/bookings"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { queryKeys } from "@/lib/queryClient"

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const campaignId = params.id as string

  const { data: campaign, isLoading } = useQuery({
    queryKey: queryKeys.campaigns.detail(campaignId),
    queryFn: () => campaignsApi.getCampaignById(campaignId),
  })

  const { data: bookings = [] } = useQuery({
    queryKey: queryKeys.bookings.byCampaign(campaignId),
    queryFn: () => bookingsApi.getByCampaign(campaignId),
  })

  const { data: bookingStats } = useQuery({
    queryKey: queryKeys.bookings.campaignStats(campaignId),
    queryFn: () => bookingsApi.getCampaignStats(campaignId),
  })

  console.log({ bookings, bookingStats })

  const deleteMutation = useMutation({
    mutationFn: () => campaignsApi.delete(campaignId),
    onSuccess: () => {
      toast({ title: "Campaign deleted successfully" })
      router.push("/campaigns")
    },
    onError: () => {
      toast({ title: "Failed to delete campaign", variant: "destructive" })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-white/60">Campaign not found</p>
        <Link href="/seller/campaigns">
          <Button variant="outline">Back to Campaigns</Button>
        </Link>
      </div>
    )
  }

  const filteredBookings = statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter)

  const confirmedSummary = bookingStats?.summary?.find((s: any) => s.status === "CONFIRMED")

  const totalRevenue = confirmedSummary ? Number(confirmedSummary._sum?.totalAmount ?? 0) : 0

  const totalTicketsSold = confirmedSummary ? Number(confirmedSummary._sum?.quantity ?? 0) : 0

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/seller/campaigns">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/campaigns/${campaignId}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-500">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Campaign Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{campaign.name}</h1>
              <div className="flex items-center gap-4 text-white/60">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(campaign.startDate)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {campaign.location}
                </span>
              </div>
            </div>
            <Badge
              className={
                campaign.status === "active" ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"
              }
            >
              {campaign.status}
            </Badge>
          </div>
          <p className="text-white/60">{campaign.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white/5 border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Ticket className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-white/60">Tickets Sold</p>
                <p className="text-2xl font-bold">{totalTicketsSold}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-white/5">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="tickets">Ticket Types</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All ({bookings.length})
                </Button>
                <Button
                  variant={statusFilter === "confirmed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("confirmed")}
                >
                  Confirmed ({bookings.filter((b) => b.status === "confirmed").length})
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending ({bookings.filter((b) => b.status === "pending").length})
                </Button>
                <Button
                  variant={statusFilter === "cancelled" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("cancelled")}
                >
                  Cancelled ({bookings.filter((b) => b.status === "cancelled").length})
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <Card className="bg-white/5 border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-white/60">Reference</th>
                      <th className="text-left p-4 text-sm font-medium text-white/60">Customer</th>
                      <th className="text-left p-4 text-sm font-medium text-white/60">Ticket Type</th>
                      <th className="text-left p-4 text-sm font-medium text-white/60">Quantity</th>
                      <th className="text-left p-4 text-sm font-medium text-white/60">Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-white/60">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-white/60">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4 font-mono text-sm">{booking.bookingReference}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{booking.user?.name || "N/A"}</p>
                            <p className="text-sm text-white/60">{booking.user?.email}</p>
                          </div>
                        </td>
                        <td className="p-4">{booking.ticketType}</td>
                        <td className="p-4">{booking.quantity}</td>
                        <td className="p-4 font-semibold">{formatCurrency(booking.totalAmount)}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(booking.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-white/60">{formatDate(booking.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredBookings.length === 0 && (
                  <div className="p-12 text-center text-white/60">No bookings found</div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <div className="grid gap-4">
              {(() => {
                // Normalize ticketTypes to an array to avoid `.map` on non-array values
                const rawTicketTypes = campaign.ticketTypes as any
                const ticketTypesArray = Array.isArray(rawTicketTypes)
                  ? rawTicketTypes
                  : rawTicketTypes
                    ? Object.values(rawTicketTypes)
                    : []

                // Optional: inspect the actual shape during development
                console.log("campaign.ticketTypes", rawTicketTypes)

                return ticketTypesArray.map((ticket: any, index: number) => (
                  <Card key={index} className="p-6 bg-white/5 border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{ticket.name}</h3>
                        <p className="text-white/60">
                          Available: {ticket.available} / {ticket.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(ticket.price)}</p>
                        <p className="text-sm text-white/60">per ticket</p>
                      </div>
                    </div>
                  </Card>
                ))
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-black border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
