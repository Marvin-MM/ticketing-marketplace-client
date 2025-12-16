"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { campaignsApi } from "@/lib/api/campaigns"
import { queryKeys } from "@/lib/queryClient"
import { CampaignsGrid } from "@/components/campaigns/campaigns-grid"
import type { CampaignFilters } from "@/lib/types"

export default function EventsPage() {
  const [filters, setFilters] = useState<CampaignFilters>({
    page: 1,
    limit: 12,
    sortBy: "eventDate",
    sortOrder: "asc",
  })

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.campaigns.list(filters),
    queryFn: () => campaignsApi.getCampaigns(filters),
  })

  const handleFilterChange = (newFilters: CampaignFilters) => {
    setFilters(newFilters)
  }

  return (
    <CampaignsGrid
      campaigns={data?.campaigns || []}
      isLoading={isLoading}
      pagination={data?.pagination}
      filters={filters}
      onFilterChange={handleFilterChange}
      title="Explore Events"
      description="Discover amazing events happening near you"
      campaignLinkPrefix="/customer/events"
      gridCols={{ default: 1, md: 2, lg: 3, xl: 4 }}
      emptyMessage="No events match your criteria. Try adjusting your filters or browse our featured events."
    />
  )
}