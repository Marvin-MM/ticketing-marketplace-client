import React from 'react'
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, SlidersHorizontal, Calendar, MapPin, FilterX } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import type { CampaignFilters, EventType, Campaign } from "@/lib/types"

export interface CampaignsGridProps {
  campaigns?: Campaign[]
  isLoading?: boolean
  pagination?: {
    page: number
    pages: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters?: CampaignFilters
  onFilterChange?: (filters: CampaignFilters) => void
  title?: string
  description?: string
  showFilters?: boolean
  showSearch?: boolean
  showResultsCount?: boolean
  showPagination?: boolean
  emptyMessage?: string | React.ReactNode
  gridCols?: {
    default?: number
    md?: number
    lg?: number
    xl?: number
  }
  className?: string
  campaignLinkPrefix?: string
  onCampaignClick?: (campaign: Campaign) => void
  renderCampaign?: (campaign: Campaign) => React.ReactNode
  renderHeader?: () => React.ReactNode
  renderEmptyState?: () => React.ReactNode
}

export const CampaignsGrid = ({
  campaigns = [],
  isLoading = false,
  pagination,
  filters = {
    page: 1,
    limit: 12,
    sortBy: "eventDate",
    sortOrder: "asc",
  },
  onFilterChange,
  title = "Explore Events",
  description = "Discover amazing events happening near you",
  showFilters = true,
  showSearch = true,
  showResultsCount = true,
  showPagination = true,
  emptyMessage = "No events found. Try adjusting your filters or search query.",
  gridCols = { default: 1, md: 2, lg: 3, xl: 4 },
  className = "",
  campaignLinkPrefix = "/customer/events",
  onCampaignClick,
  renderCampaign,
  renderHeader,
  renderEmptyState,
}: CampaignsGridProps) => {
  const [searchQuery, setSearchQuery] = React.useState(filters.search || "")
  const [localFilters, setLocalFilters] = React.useState(filters)

  // Common event types
  const eventTypes: EventType[] = [
    "CONCERT", 
    "SPORTS", 
    "THEATER", 
    "CONFERENCE", 
    "FESTIVAL", 
    "BAR", 
    "HOTEL", 
    "OTHER"
  ]

  // Update local filters when props change
  React.useEffect(() => {
    setLocalFilters(filters)
    setSearchQuery(filters.search || "")
  }, [filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...localFilters, search: searchQuery, page: 1 }
    setLocalFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const updateFilter = (key: keyof CampaignFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value, page: 1 }
    setLocalFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: CampaignFilters = {
      page: 1,
      limit: 12,
      sortBy: "eventDate",
      sortOrder: "asc",
    }
    setLocalFilters(defaultFilters)
    setSearchQuery("")
    onFilterChange?.(defaultFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...localFilters, page }
    setLocalFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const getGridClasses = () => {
    const cols = {
      default: gridCols.default || 1,
      md: gridCols.md || 2,
      lg: gridCols.lg || 3,
      xl: gridCols.xl || 4
    }
    return `grid gap-6 grid-cols-${cols.default} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg} xl:grid-cols-${cols.xl}`
  }

  // Default campaign renderer
  const defaultRenderCampaign = (campaign: Campaign) => {
    return (
      <Link 
        key={campaign.id} 
        href={`${campaignLinkPrefix}/${campaign.id}`}
        onClick={() => onCampaignClick?.(campaign)}
        className="block h-full"
      >
      <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer h-full hover:shadow-lg">
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
          {campaign.isFeatured && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
          
          {/* Date */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{formatDate(campaign.eventDate, "PPP")}</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">
              {campaign.venue}, {campaign.venueCity}
            </span>
          </div>

          {/* Price and Availability */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-sm font-medium">
              From {formatCurrency(Math.min(...Object.values(campaign.ticketTypes).map((t) => t.price)))}
            </span>
            <span className="text-xs text-muted-foreground">
              {campaign.totalQuantity - campaign.soldQuantity} tickets left
            </span>
          </div>

          {/* Organizer */}
          {campaign.seller && (
            <div className="text-xs text-muted-foreground mt-2">
              By {campaign.seller.businessName || campaign.seller.companyName}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
    )
  }

  // Default empty state
  const defaultRenderEmptyState = () => (
    <Card className="p-12">
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No events found</h3>
        {typeof emptyMessage === 'string' ? (
          <p className="text-muted-foreground">{emptyMessage}</p>
        ) : (
          emptyMessage
        )}
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="mt-4"
        >
          <FilterX className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    </Card>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {renderHeader ? (
        renderHeader()
      ) : (
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      )}

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          {showSearch && (
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events by title, venue, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          )}

          {/* Filters */}
          {showFilters && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {(filters.eventType || filters.priceMin || filters.priceMax || filters.search) && (
                    <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filter Events</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 mt-6">
                  {/* Event Type */}
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select
                      value={localFilters.eventType || "all"}
                      onValueChange={(value) =>
                        updateFilter("eventType", value === "all" ? undefined : (value as EventType))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select 
                      value={localFilters.sortBy || "eventDate"} 
                      onValueChange={(value) => updateFilter("sortBy", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eventDate">Event Date</SelectItem>
                        <SelectItem value="createdAt">Recently Added</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="soldQuantity">Most Popular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Select 
                      value={localFilters.sortOrder || "asc"} 
                      onValueChange={(value) => updateFilter("sortOrder", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min price"
                        value={localFilters.priceMin || ""}
                        onChange={(e) => 
                          updateFilter("priceMin", e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max price"
                        value={localFilters.priceMax || ""}
                        onChange={(e) => 
                          updateFilter("priceMax", e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </div>
                  </div>

                  {/* Clear filters */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={clearFilters}
                    >
                      <FilterX className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                    <SheetTrigger asChild>
                      <Button className="flex-1">
                        Apply Filters
                      </Button>
                    </SheetTrigger>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      )}

      {/* Results count */}
      {showResultsCount && campaigns.length > 0 && pagination && (
        <div className="text-sm text-muted-foreground">
          Showing {campaigns.length} of {pagination.total} events
          {filters.search && (
            <span className="ml-2">
              for "<span className="font-medium">{filters.search}</span>"
            </span>
          )}
        </div>
      )}

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className={getGridClasses()}>
          {[...Array(filters.limit || 12)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : campaigns.length > 0 ? (
        <>
          <div className={getGridClasses()}>
            {campaigns.map((campaign) => 
              renderCampaign ? renderCampaign(campaign) : defaultRenderCampaign(campaign)
            )}
          </div>

          {/* Pagination */}
          {showPagination && pagination && pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={!pagination.hasPrev}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = i + 1
                    if (pagination.pages <= 5) return pageNum
                    
                    // Logic for showing pages with ellipsis
                    const currentPage = pagination.page
                    let showPage = false
                    
                    if (pageNum <= 2) showPage = true
                    else if (pageNum >= pagination.pages - 1) showPage = true
                    else if (Math.abs(pageNum - currentPage) <= 1) showPage = true
                    
                    if (!showPage && (pageNum === 3 || pageNum === pagination.pages - 2)) {
                      return <span key={i} className="px-3 py-2">...</span>
                    }
                    
                    if (!showPage) return null
                    
                    return (
                      <Button
                        key={i}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        renderEmptyState ? renderEmptyState() : defaultRenderEmptyState()
      )}
    </div>
  )
}