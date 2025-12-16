"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { campaignsApi } from "@/lib/api/campaigns"
import { queryKeys } from "@/lib/queryClient"
import { CampaignsGrid } from "@/components/campaigns/campaigns-grid"
import type { CampaignFilters } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ticket, Calendar, MapPin, Users, TrendingUp, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Image from "next/image"

export default function EventsPage() {
  const [filters, setFilters] = useState<CampaignFilters>({
    page: 1,
    limit: 12,
    sortBy: "eventDate",
    sortOrder: "asc",
  })

  // Fetch all events
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.campaigns.list(filters),
    queryFn: () => campaignsApi.getCampaigns(filters),
  })

  const handleFilterChange = (newFilters: CampaignFilters) => {
    setFilters(newFilters)
  }

  const eventTypes = [
    { name: "All Events", value: "all" },
    { name: "Concerts", value: "CONCERT" },
    { name: "Sports", value: "SPORTS" },
    { name: "Conferences", value: "CONFERENCE" },
    { name: "Festivals", value: "FESTIVAL" },
    { name: "Theater", value: "THEATER" },
    { name: "Bars & Clubs", value: "BAR" },
    { name: "Hotels", value: "HOTEL" },
    { name: "Other", value: "OTHER" },
  ]

  const quickFilters = [
    { label: "This Weekend", icon: Calendar, filter: { eventDateFrom: getWeekendDate() } },
    { label: "Near You", icon: MapPin, filter: {} },
    { label: "Popular", icon: TrendingUp, filter: { sortBy: "soldQuantity", sortOrder: "desc" } },
    { label: "Group Events", icon: Users, filter: {} },
  ]

  function getWeekendDate() {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilSaturday = 6 - dayOfWeek
    const saturday = new Date(today)
    saturday.setDate(today.getDate() + daysUntilSaturday)
    return saturday.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-50 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center text-white hover:text-white/90 transition-colors">
              <Image
                src="/logo.png"
                alt="LucoTicket"
                width={32}
                height={32}
                className="h-14 w-auto"
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/events" className="text-sm font-medium text-white">
              Events
            </Link>
            <Link href="/apply-seller" className="text-sm hover:text-white transition-colors">
              Organize
            </Link>
            <Link href="/about" className="text-sm hover:text-white transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Focused */}
      <section className="relative overflow-hidden border-b border-white/10">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Discover Events</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Your Next{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Experience
              </span>
            </h1>
            
            <p className="text-xl text-white/60 mb-10 max-w-2xl">
              Browse thousands of events happening across East Afica. From concerts and sports to conferences and festivals - find something amazing today.
            </p>
            
            {/* Enhanced Search */}
            <div className="max-w-3xl">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    placeholder="What are you looking for? Try 'concert', 'sports', or 'workshop'..."
                    className="pl-12 pr-4 py-6 text-base bg-white/5 border-white/10 focus:bg-white/10"
                    onChange={(e) => {
                      if (e.target.value.length >= 2) {
                        handleFilterChange({ ...filters, search: e.target.value, page: 1 })
                      } else if (e.target.value.length === 0) {
                        const { search, ...rest } = filters
                        handleFilterChange({ ...rest, page: 1 })
                      }
                    }}
                  />
                </div>
                <Button size="lg" className="px-8">
                  Search Events
                </Button>
              </div>
              
              {/* Event Type Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {eventTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={filters.eventType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (type.value === "all") {
                        const { eventType, ...rest } = filters
                        handleFilterChange({ ...rest, page: 1 })
                      } else {
                        handleFilterChange({ ...filters, eventType: type.value as any, page: 1 })
                      }
                    }}
                    className="rounded-full"
                  >
                    {type.name}
                  </Button>
                ))}
              </div>
              
              {/* Quick Filters */}
              <div className="flex flex-wrap gap-3">
                {quickFilters.map((quickFilter) => (
                  <Button
                    key={quickFilter.label}
                    variant="ghost"
                    size="sm"
                    className="text-sm text-white/60 hover:text-white hover:bg-white/5"
                    onClick={() => handleFilterChange({ ...filters, ...quickFilter.filter, page: 1 })}
                  >
                    <quickFilter.icon className="h-4 w-4 mr-2" />
                    {quickFilter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Events Section */}
      <section>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg md:text-3xl font-bold">All Upcoming Events</h2>
              <p className="text-white/60 mt-2 text-xs md:text-sm">
                {data?.pagination.total ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-white">
                      {data.pagination.total.toLocaleString()}
                    </span>{" "}
                    events in East Africa
                  </>
                ) : (
                  "Browse events happening near you"
                )}
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange({ ...filters, sortBy: "eventDate", sortOrder: "asc" })}
                className={filters.sortBy === "eventDate" ? "bg-white/10" : ""}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Soonest
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange({ ...filters, sortBy: "popularity", sortOrder: "desc" })}
                className={filters.sortBy === "popularity" ? "bg-white/10" : ""}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Popular
              </Button>
            </div>
          </div>

          {/* Events Grid */}
          <CampaignsGrid
            campaigns={data?.campaigns || []}
            isLoading={isLoading}
            pagination={data?.pagination}
            filters={filters}
            onFilterChange={handleFilterChange}
            title=""
            description=""
            campaignLinkPrefix="/events"
            gridCols={{ default: 1, md: 2, lg: 3, xl: 4 }}
            emptyMessage={
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                  <Search className="h-8 w-8 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-white/60 mb-6">
                  {filters.search 
                    ? `No events found for "${filters.search}". Try a different search term.`
                    : "No events match your current filters. Try adjusting your search criteria."}
                </p>
                {(filters.search || filters.eventType) && (
                  <Button
                    variant="outline"
                    onClick={() => handleFilterChange({ page: 1, limit: 12, sortBy: "eventDate", sortOrder: "asc" })}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            }
            showFilters={true}
            showSearch={false}
            showResultsCount={false}
            showPagination={true}
            renderHeader={() => null}
            className="mt-4"
          />
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Ready to Experience?</h2>
            <p className="text-white/60 text-lg mb-8">
              Create an account to book tickets instantly, save your favorite events, and get personalized recommendations.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/apply-seller">
                <Button size="lg" variant="outline">
                  Organize Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Same as Homepage */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center text-white hover:text-white/90 transition-colors">
              <Image
                src="/logo.png"
                alt="LucoTicket"
                width={32}
                height={32}
                className="h-16 w-auto"
              />
            </Link>
              </div>
              <p className="text-sm text-white/60">
                East Afica's leading event ticketing platform. Discover, book, and experience unforgettable events.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Event Categories</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link href="/events?eventType=CONCERT" className="hover:text-white transition-colors">
                    Concerts
                  </Link>
                </li>
                <li>
                  <Link href="/events?eventType=SPORTS" className="hover:text-white transition-colors">
                    Sports Events
                  </Link>
                </li>
                <li>
                  <Link href="/events?eventType=CONFERENCE" className="hover:text-white transition-colors">
                    Conferences
                  </Link>
                </li>
                <li>
                  <Link href="/events?eventType=FESTIVAL" className="hover:text-white transition-colors">
                    Festivals
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/refunds" className="hover:text-white transition-colors">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-white/60">
                &copy; 2025 LucoTicket. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>Follow us:</span>
                <Link href="https://twitter.com/LucoTicket" className="hover:text-white transition-colors">
                  Twitter
                </Link>
                <Link href="https://instagram.com/LucoTicket" className="hover:text-white transition-colors">
                  Instagram
                </Link>
                <Link href="https://facebook.com/LucoTicket" className="hover:text-white transition-colors">
                  Facebook
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}