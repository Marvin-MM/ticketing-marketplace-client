"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { campaignsApi } from "@/lib/api/campaigns"
import { financeApi } from "@/lib/api/finance"
import { queryKeys } from "@/lib/queryClient"
import { DollarSign, Calendar, TrendingUp, Users, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils/format"

export default function SellerDashboardPage() {
  // Fetch seller's campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: queryKeys.campaigns.seller({ status: "ACTIVE", limit: 5 }),
    queryFn: () => campaignsApi.getMyCampaigns({ status: "ACTIVE", limit: 5 }),
  })

  // Fetch finance dashboard
  const { data: financeData, isLoading: financeLoading } = useQuery({
    queryKey: queryKeys.finance.dashboard,
    queryFn: financeApi.getDashboard,
  })

  const activeCampaigns = campaignsData?.campaigns?.length || 0
  const totalRevenue = financeData?.finance?.totalEarnings || 0
  const availableBalance = financeData?.finance?.availableBalance || 0

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your events and track your revenue</p>
        </div>
        <Button asChild size="lg">
          <Link href="/seller/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {financeLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {financeLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(availableBalance)}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{activeCampaigns}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently running</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Active Campaigns</h2>
            <p className="text-muted-foreground">Your currently running events</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/seller/campaigns">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {campaignsLoading ? (
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
        ) : campaignsData && campaignsData.campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaignsData.campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={campaign.coverImage || `/placeholder.svg?height=96&width=96&query=${campaign.title}`}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{campaign.title}</h3>
                          <p className="text-sm text-muted-foreground">{campaign.eventType}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(campaign.eventDate, "PPP")}
                        </div>
                        <div>
                          Sold: {campaign.soldQuantity} / {campaign.totalQuantity}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Revenue: </span>
                          <span className="font-semibold">
                            {formatCurrency(
                              campaign.soldQuantity *
                                Math.min(...Object.values(campaign.ticketTypes).map((t) => t.price)),
                            )}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/seller/campaigns/${campaign.id}`}>
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
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No active campaigns</h3>
              <p className="text-muted-foreground">Create your first campaign to start selling tickets</p>
              <Button asChild className="mt-4">
                <Link href="/seller/campaigns/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Link>
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Recent Transactions */}
      {financeData && financeData.transactions && financeData.transactions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Recent Transactions</h2>
              <p className="text-muted-foreground">Your latest financial activity</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/seller/finance">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {financeData.transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          transaction.type === "SALE"
                            ? "bg-green-500/10"
                            : transaction.type === "WITHDRAWAL"
                              ? "bg-blue-500/10"
                              : "bg-red-500/10"
                        }`}
                      >
                        <DollarSign
                          className={`h-5 w-5 ${
                            transaction.type === "SALE"
                              ? "text-green-500"
                              : transaction.type === "WITHDRAWAL"
                                ? "text-blue-500"
                                : "text-red-500"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">{transaction.reference}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold ${
                          transaction.type === "SALE"
                            ? "text-green-500"
                            : transaction.type === "WITHDRAWAL"
                              ? "text-blue-500"
                              : "text-red-500"
                        }`}
                      >
                        {transaction.type === "SALE" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">{formatDate(transaction.createdAt, "PPP")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/seller/campaigns/new">
            <CardContent className="p-6 text-center space-y-2">
              <Plus className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">Create Campaign</h3>
              <p className="text-sm text-muted-foreground">Start selling tickets for your event</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/seller/analytics">
            <CardContent className="p-6 text-center space-y-2">
              <TrendingUp className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">View Analytics</h3>
              <p className="text-sm text-muted-foreground">Track your performance metrics</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/seller/finance">
            <CardContent className="p-6 text-center space-y-2">
              <DollarSign className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">Manage Finance</h3>
              <p className="text-sm text-muted-foreground">Withdraw earnings and view transactions</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
