import React from 'react'
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils/format"

export interface Campaign {
  id: string
  title: string
  eventType: string
  coverImage?: string
  eventDate: string
  venue: string
  ticketTypes: Record<string, { price: number }>
  totalQuantity: number
  soldQuantity: number
}

export interface FeaturedCampaignsProps {
  campaigns?: Campaign[]
  isLoading?: boolean
  title?: string
  description?: string
  viewAllLink?: string
  itemsToShow?: number
  showViewAll?: boolean
  className?: string
  gridCols?: {
    default?: number
    md?: number
    lg?: number
  }
  emptyMessage?: string
}

export const FeaturedCampaigns = ({
  campaigns = [],
  isLoading = false,
  title = "Featured Events",
  description = "Handpicked events you might love",
  viewAllLink = "/events",
  itemsToShow = 6,
  showViewAll = true,
  className = "",
  gridCols = { default: 1, md: 2, lg: 3 },
  emptyMessage = "No featured events available"
}: FeaturedCampaignsProps) => {
  const displayedCampaigns = campaigns.slice(0, itemsToShow)

  const getGridClasses = () => {
    const cols = {
      default: gridCols.default || 1,
      md: gridCols.md || 2,
      lg: gridCols.lg || 3
    }
    return `grid gap-6 grid-cols-${cols.default} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        {showViewAll && campaigns.length > 0 && (
          <Button variant="ghost" asChild>
            <Link href={viewAllLink}>
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className={getGridClasses()}>
          {[...Array(itemsToShow)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Empty State */}
          {displayedCampaigns.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">{emptyMessage}</p>
              </CardContent>
            </Card>
          ) : (
            /* Campaigns Grid */
            <div className={getGridClasses()}>
              {displayedCampaigns.map((campaign) => (
                <Link key={campaign.id} href={`/events/${campaign.id}`} className="block">
                  <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer h-full">
                    {/* Cover Image */}
                    <div className="relative h-48 bg-muted">
                      <img
                        src={campaign.coverImage || `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(campaign.title)}`}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                        {campaign.eventType}
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(campaign.eventDate, "PPP")} • {campaign.venue}
                      </p>
                      
                      {/* Price and Availability */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-medium">
                          From {formatCurrency(Math.min(...Object.values(campaign.ticketTypes).map((t) => t.price)))}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {campaign.totalQuantity - campaign.soldQuantity} tickets left
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}