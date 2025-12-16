"use client"

import { useQuery } from "@tanstack/react-query"
import { TrendingUp, DollarSign, Ticket, Calendar, ArrowUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { campaignsApi } from "@/lib/api/campaigns"
import { bookingsApi } from "@/lib/api/bookings"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { queryKeys } from "@/lib/queryClient"

export default function AnalyticsPage() {
  const { data: campaigns = [] } = useQuery({
    queryKey: queryKeys.campaigns.list(),
    queryFn: () => campaignsApi.getAll(),
  })

  const { data: bookings = [] } = useQuery({
    queryKey: queryKeys.bookings.list(),
    queryFn: () => bookingsApi.getAll(),
  })

  // Calculate metrics
  const totalRevenue = bookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.totalAmount, 0)

  const totalTicketsSold = bookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.quantity, 0)

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length

  const conversionRate =
    bookings.length > 0 ? (bookings.filter((b) => b.status === "confirmed").length / bookings.length) * 100 : 0

  // Top performing campaigns
  const campaignRevenue = campaigns
    .map((campaign) => {
      const campaignBookings = bookings.filter((b) => b.campaign?._id === campaign._id && b.status === "confirmed")
      const revenue = campaignBookings.reduce((sum, b) => sum + b.totalAmount, 0)
      const ticketsSold = campaignBookings.reduce((sum, b) => sum + b.quantity, 0)
      return { campaign, revenue, ticketsSold, bookings: campaignBookings.length }
    })
    .sort((a, b) => b.revenue - a.revenue)

  // Recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-white/60">Track your performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <ArrowUp className="h-4 w-4" />
              12.5%
            </div>
          </div>
          <p className="text-sm text-white/60 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Ticket className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <ArrowUp className="h-4 w-4" />
              8.2%
            </div>
          </div>
          <p className="text-sm text-white/60 mb-1">Tickets Sold</p>
          <p className="text-3xl font-bold">{totalTicketsSold}</p>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex items-center gap-1 text-white/60 text-sm">0%</div>
          </div>
          <p className="text-sm text-white/60 mb-1">Active Campaigns</p>
          <p className="text-3xl font-bold">{activeCampaigns}</p>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <ArrowUp className="h-4 w-4" />
              3.1%
            </div>
          </div>
          <p className="text-sm text-white/60 mb-1">Conversion Rate</p>
          <p className="text-3xl font-bold">{conversionRate.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="bg-white/5">
          <TabsTrigger value="campaigns">Top Campaigns</TabsTrigger>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card className="bg-white/5 border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold">Top Performing Campaigns</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Campaign</th>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Revenue</th>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Tickets Sold</th>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Bookings</th>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignRevenue.slice(0, 10).map(({ campaign, revenue, ticketsSold, bookings }) => (
                    <tr key={campaign._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-white/60">{campaign.eventType}</p>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-green-500">{formatCurrency(revenue)}</td>
                      <td className="p-4">{ticketsSold}</td>
                      <td className="p-4">{bookings}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            campaign.status === "active"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-gray-500/10 text-gray-500"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {campaignRevenue.length === 0 && <div className="p-12 text-center text-white/60">No campaigns yet</div>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card className="bg-white/5 border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold">Recent Bookings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Reference</th>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Campaign</th>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 font-mono text-sm">{booking.bookingReference}</td>
                      <td className="p-4">{booking.campaign?.name || "N/A"}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{booking.user?.name || "N/A"}</p>
                          <p className="text-sm text-white/60">{booking.user?.email}</p>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">{formatCurrency(booking.totalAmount)}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            booking.status === "confirmed"
                              ? "bg-green-500/10 text-green-500"
                              : booking.status === "cancelled"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-white/60">{formatDate(booking.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
