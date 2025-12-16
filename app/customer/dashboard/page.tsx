// "use client"

// import { useQuery } from "@tanstack/react-query"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Skeleton } from "@/components/ui/skeleton"
// import { campaignsApi } from "@/lib/api/campaigns"
// import { bookingsApi } from "@/lib/api/bookings"
// import { queryKeys } from "@/lib/queryClient"
// import { useAuth } from "@/lib/hooks/useAuth"
// import { Calendar, Ticket, TrendingUp, ArrowRight } from "lucide-react"
// import Link from "next/link"
// import { formatCurrency, formatDate } from "@/lib/utils/format"

// export default function CustomerDashboardPage() {
//   const { user } = useAuth()

//   // Fetch featured events
//   const { data: featuredData, isLoading: featuredLoading } = useQuery({
//     queryKey: queryKeys.campaigns.featured(10),
//     queryFn: () => campaignsApi.getFeatured(10),
//   })

//   // Fetch user's bookings
//   const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
//     queryKey: queryKeys.bookings.myBookings({ status: "CONFIRMED", limit: 5 }),
//     queryFn: () => bookingsApi.getMyBookings({ status: "CONFIRMED", limit: 5 }),
//   })

//   const upcomingEvents =
//     bookingsData?.bookings?.filter((booking) => {
//       return new Date(booking.campaign.eventDate) > new Date()
//     }).length || 0

//   const totalBookings = bookingsData?.pagination?.total || 0

//   return (
//     <div className="space-y-8">
//       {/* Welcome section */}
//       <div>
//         <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
//         <p className="text-muted-foreground mt-2">Discover amazing events and manage your bookings</p>
//       </div>

//       {/* Stats cards */}
//       <div className="grid gap-4 md:grid-cols-3">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
//             <Calendar className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             {bookingsLoading ? (
//               <Skeleton className="h-8 w-16" />
//             ) : (
//               <>
//                 <div className="text-2xl font-bold">{upcomingEvents}</div>
//                 <p className="text-xs text-muted-foreground mt-1">Events you're attending</p>
//               </>
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
//             <Ticket className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             {bookingsLoading ? (
//               <Skeleton className="h-8 w-16" />
//             ) : (
//               <>
//                 <div className="text-2xl font-bold">{totalBookings}</div>
//                 <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
//               </>
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             {bookingsLoading ? (
//               <Skeleton className="h-8 w-16" />
//             ) : (
//               <>
//                 <div className="text-2xl font-bold">{upcomingEvents * 2}</div>
//                 <p className="text-xs text-muted-foreground mt-1">Ready to use</p>
//               </>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Featured Events */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-2xl font-bold tracking-tight">Featured Events</h2>
//             <p className="text-muted-foreground">Handpicked events you might love</p>
//           </div>
//           <Button variant="ghost" asChild>
//             <Link href="/customer/events">
//               View all
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </Link>
//           </Button>
//         </div>

//         {featuredLoading ? (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {[...Array(6)].map((_, i) => (
//               <Card key={i}>
//                 <Skeleton className="h-48 w-full rounded-t-lg" />
//                 <CardContent className="p-4 space-y-2">
//                   <Skeleton className="h-6 w-3/4" />
//                   <Skeleton className="h-4 w-1/2" />
//                   <Skeleton className="h-4 w-full" />
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {featuredData?.campaigns?.slice(0, 6).map((campaign) => (
//               <Link key={campaign.id} href={`/customer/events/${campaign.id}`}>
//                 <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer">
//                   <div className="relative h-48 bg-muted">
//                     <img
//                       src={campaign.coverImage || `/placeholder.svg?height=200&width=400&query=${campaign.title}`}
//                       alt={campaign.title}
//                       className="w-full h-full object-cover"
//                     />
//                     <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
//                       {campaign.eventType}
//                     </div>
//                   </div>
//                   <CardContent className="p-4">
//                     <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       {formatDate(campaign.eventDate, "PPP")} • {campaign.venue}
//                     </p>
//                     <div className="flex items-center justify-between mt-3">
//                       <span className="text-sm font-medium">
//                         From {formatCurrency(Math.min(...Object.values(campaign.ticketTypes).map((t) => t.price)))}
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         {campaign.totalQuantity - campaign.soldQuantity} tickets left
//                       </span>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Recent Bookings */}
//       {bookingsData && bookingsData.bookings.length > 0 && (
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold tracking-tight">Recent Bookings</h2>
//               <p className="text-muted-foreground">Your latest ticket purchases</p>
//             </div>
//             <Button variant="ghost" asChild>
//               <Link href="/customer/bookings">
//                 View all
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Link>
//             </Button>
//           </div>

//           <div className="space-y-3">
//             {bookingsData.bookings.map((booking) => (
//               <Card key={booking.id}>
//                 <CardContent className="p-4">
//                   <div className="flex items-center gap-4">
//                     <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
//                       <img
//                         src={
//                           booking.campaign.coverImage ||
//                           `/placeholder.svg?height=64&width=64&query=${booking.campaign.title || "/placeholder.svg"}`
//                         }
//                         alt={booking.campaign.title}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h3 className="font-semibold truncate">{booking.campaign.title}</h3>
//                       <p className="text-sm text-muted-foreground">
//                         {formatDate(booking.campaign.eventDate, "PPP")} • {booking.quantity} ticket(s)
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <div className="font-semibold">{formatCurrency(booking.totalAmount)}</div>
//                       <div className="text-xs text-muted-foreground">{booking.bookingRef}</div>
//                     </div>
//                     <Button variant="outline" size="sm" asChild>
//                       <Link href={`/customer/bookings/${booking.id}`}>View</Link>
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { campaignsApi } from "@/lib/api/campaigns"
import { bookingsApi } from "@/lib/api/bookings"
import { queryKeys } from "@/lib/queryClient"
import { useAuth } from "@/lib/hooks/useAuth"
import { Calendar, Ticket, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { FeaturedCampaigns } from "@/components/campaigns/featured-campaigns"

export default function CustomerDashboardPage() {
  const { user } = useAuth()

  // Fetch featured events
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: queryKeys.campaigns.featured(10),
    queryFn: () => campaignsApi.getFeatured(10),
  })

  // Fetch user's bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: queryKeys.bookings.myBookings({ status: "CONFIRMED", limit: 5 }),
    queryFn: () => bookingsApi.getMyBookings({ status: "CONFIRMED", limit: 5 }),
  })

  const upcomingEvents =
    bookingsData?.bookings?.filter((booking) => {
      return new Date(booking.campaign.eventDate) > new Date()
    }).length || 0

  const totalBookings = bookingsData?.pagination?.total || 0

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
        <p className="text-muted-foreground mt-2">Discover amazing events and manage your bookings</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{upcomingEvents}</div>
                <p className="text-xs text-muted-foreground mt-1">Events you're attending</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalBookings}</div>
                <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{upcomingEvents * 2}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready to use</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Featured Events using reusable component */}
      <FeaturedCampaigns
        campaigns={featuredData?.campaigns || []}
        isLoading={featuredLoading}
        viewAllLink="/customer/events"
        itemsToShow={6}
      />

      {/* Recent Bookings */}
      {bookingsData && bookingsData.bookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Recent Bookings</h2>
              <p className="text-muted-foreground">Your latest ticket purchases</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/customer/bookings">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {bookingsData.bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={
                          booking.campaign.coverImage ||
                          `/placeholder.svg?height=64&width=64&query=${booking.campaign.title || "/placeholder.svg"}`
                        }
                        alt={booking.campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{booking.campaign.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(booking.campaign.eventDate, "PPP")} • {booking.quantity} ticket(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(booking.totalAmount)}</div>
                      <div className="text-xs text-muted-foreground">{booking.bookingRef}</div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/customer/bookings/${booking.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}