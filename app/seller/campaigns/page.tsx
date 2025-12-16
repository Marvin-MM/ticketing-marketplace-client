"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { campaignsApi } from "@/lib/api/campaigns"
import { queryKeys } from "@/lib/queryClient"
import { Calendar, MapPin, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import type { CampaignStatus } from "@/lib/types"

export default function SellerCampaignsPage() {
  const [activeTab, setActiveTab] = useState<"all" | CampaignStatus>("all")

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.campaigns.seller({ status: activeTab === "all" ? undefined : activeTab }),
    queryFn: () => campaignsApi.getMyCampaigns({ status: activeTab === "all" ? undefined : activeTab }),
  })

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "DRAFT":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
      case "PAUSED":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "ENDED":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-2">Manage your event campaigns</p>
        </div>
        <Button asChild size="lg">
          <Link href="/seller/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          <TabsTrigger value="PAUSED">Paused</TabsTrigger>
          <TabsTrigger value="ENDED">Ended</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-32 w-32 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data && data.campaigns.length > 0 ? (
            <div className="space-y-4">
              {data.campaigns.map((campaign) => {
                const revenue =
                  campaign.soldQuantity * Math.min(...Object.values(campaign.ticketTypes).map((t) => t.price))
                const soldPercentage = (campaign.soldQuantity / campaign.totalQuantity) * 100

                return (
                  <Card key={campaign.id} className="hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Campaign image */}
                        <div className="relative h-32 w-full lg:w-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={campaign.coverImage || `/placeholder.svg?height=128&width=128&query=${campaign.title}`}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Campaign details */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-xl">{campaign.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{campaign.eventType}</p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(campaign.eventDate, "PPP")}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {campaign.venue}, {campaign.venueCity}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Tickets Sold</div>
                              <div className="font-semibold">
                                {campaign.soldQuantity} / {campaign.totalQuantity}
                              </div>
                              <div className="text-xs text-muted-foreground">{soldPercentage.toFixed(0)}% sold</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Revenue</div>
                              <div className="font-semibold">{formatCurrency(revenue)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Views</div>
                              <div className="font-semibold">{campaign.analytics?.totalViews || 0}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Bookings</div>
                              <div className="font-semibold">{campaign.analytics?.totalBookings || 0}</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/seller/campaigns/${campaign.id}`}>View details</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/seller/campaigns/${campaign.id}/edit`}>Edit</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/seller/campaigns/${campaign.id}/analytics`}>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Analytics
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center space-y-2">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">No campaigns found</h3>
                <p className="text-muted-foreground">
                  {activeTab === "all"
                    ? "Create your first campaign to start selling tickets"
                    : `No ${activeTab.toLowerCase()} campaigns`}
                </p>
                <Button asChild className="mt-4">
                  <Link href="/seller/campaigns/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
