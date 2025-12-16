"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Calendar, Shield, Zap, Users, TrendingUp, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store/authStore"
import { FeaturedCampaigns } from "@/components/campaigns/featured-campaigns"
import { useQuery } from "@tanstack/react-query"
import { campaignsApi } from "@/lib/api/campaigns"
import { queryKeys } from "@/lib/queryClient"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  // Fetch featured campaigns for homepage
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ["homepage-featured-campaigns"],
    queryFn: () => campaignsApi.getFeatured(8),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "SELLER") {
        router.push("/seller/dashboard")
      } else {
        router.push("/customer/dashboard")
      }
    }
  }, [isAuthenticated, user, router])

  const categories = [
    { 
      name: "Concerts", 
      gif: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2Zrb3IyMnA4N3JpeHV3ZXN2Z2FuMXRxaTZyYjFhMjlqc2V5cW14dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKGzdryxKlE3gnly8/giphy.gif",
      link: "/events?eventType=CONCERT",
      color: "bg-purple-500/10",
      eventCount: 245
    },
    { 
      name: "Sports", 
      gif: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGx1dTJuam05a3VuMXZyYTY1N2hjOTg1bzM0NWZoZjh1OXZ4czJ6ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SKAQ4kWov6tdC/giphy.gif",
      link: "/events?eventType=SPORTS",
      color: "bg-green-500/10",
      eventCount: 189
    },
    { 
      name: "Conferences", 
      gif: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWF0YmhsamtiOTdwMXhpOXRoaG1hNnpkZ3VtZjN0bmw2cm95dTFtZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JUXtbHuixcZKeGJEro/giphy.gif",
      link: "/events?eventType=CONFERENCE",
      color: "bg-blue-500/10",
      eventCount: 134
    },
    { 
      name: "Festivals", 
      gif: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWlqbXg2dXpoOGIzcmFxMzA5MGR0dzM4a3RzajM0Z2dpcDFsem1oNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/123VamsyAKppew/giphy.gif",
      link: "/events?eventType=FESTIVAL",
      color: "bg-yellow-500/10",
      eventCount: 98
    },
    { 
      name: "Theater", 
      gif: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmd3dXdwMW5obHM2Yzg3ZWFzbTl5aHc1cjBwNzdsdWN3Z2lndDl3NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKzBxHeX1DHVhJe/giphy.gif",
      link: "/events?eventType=THEATER",
      color: "bg-pink-500/10",
      eventCount: 76
    },
    { 
      name: "Workshops", 
      gif: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExODBya3MwYnV1M3VuY3oxcWpkNHRmNXplcWtrb2ZtNjJhMTVsaTlpbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2ymonjpIgGTmWQ/giphy.gif",
      link: "/events?eventType=OTHER",
      color: "bg-indigo-500/10",
      eventCount: 54
    },
    { 
      name: "Comedy", 
      gif: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjFuZjd2d2N6MGt5eWRjZzc2eGIzeWMwaGl2MmlwejFjZGgyanhldiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/33kQxwJWugowdAtivp/giphy.gif",
      link: "/events?eventType=OTHER",
      color: "bg-orange-500/10",
      eventCount: 42
    },
    { 
      name: "Networking", 
      gif: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnBuaGxsZjdhM3hlZWUzaWFkZndtbm1pYmNucDU1OW9jMnNmdnQ3aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KbqJHCBj545Rv21Ah0/giphy.gif",
      link: "/events?eventType=OTHER",
      color: "bg-teal-500/10",
      eventCount: 38
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Updated Header */}
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Your Gateway to Unforgettable Events</h1>
          <p className="text-xl text-white/60 mb-8 text-pretty">
            Discover, book, and manage tickets for concerts, sports, conferences, and more. Join thousands of
            event-goers and organizers on East Africa's leading ticketing platform.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Booking
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/apply-seller">
              <Button size="lg" variant="outline">
                Become a Seller
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <FeaturedCampaigns
            campaigns={featuredData?.campaigns || []}
            isLoading={featuredLoading}
            title="Featured Events"
            description="Handpicked events you won't want to miss"
            viewAllLink="/events"
            itemsToShow={6}
            showViewAll={true}
            gridCols={{ default: 1, md: 2, lg: 3 }}
            emptyMessage="No featured events available at the moment. Check back soon!"
            className="mb-16"
          />
          
          {/* Event Categories with GIFs */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Browse by Category</h2>
                <p className="text-white/60 mt-2">Find events that match your interests</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/events">
                  View all categories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.name} 
                  href={category.link}
                  className="block group"
                >
                  <Card className={`p-0 ${category.color} border-white/10 hover:border-white/30 transition-all hover:scale-[1.02] cursor-pointer overflow-hidden`}>
                    {/* GIF Container */}
                    <div className="relative h-40 w-full overflow-hidden bg-gradient-to-b from-black/30 to-black/0">
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={category.gif}
                          alt={`${category.name} category`}
                          fill
                          className="object-cover"
                          unoptimized // Giphy GIFs work better unoptimized
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          loading="lazy"
                        />
                        {/* Gradient overlay for better text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      </div>
                      
                      {/* Category name */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                        <h4 className="font-semibold text-lg text-white">{category.name}</h4>
                        <p className="text-sm text-white/80 mt-1">{category.eventCount} events</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose LucoTicket?</h2>
            <p className="text-white/60 text-lg">Everything you need for seamless event ticketing</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-white/5 border-white/10 hover:border-white/30 transition-colors">
              <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-4">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
              <p className="text-white/60">
                Book tickets in seconds with our streamlined checkout process. Get instant confirmation and digital
                tickets.
              </p>
            </Card>

            <Card className="p-8 bg-white/5 border-white/10 hover:border-white/30 transition-colors">
              <div className="p-3 bg-green-500/10 rounded-lg w-fit mb-4">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-white/60">
                Your transactions are protected with industry-standard encryption and secure payment processing via
                Pesapal.
              </p>
            </Card>

            <Card className="p-8 bg-white/5 border-white/10 hover:border-white/30 transition-colors">
              <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-4">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Event Discovery</h3>
              <p className="text-white/60">
                Browse thousands of events across East Africa. Filter by type, date, location, and price to find your perfect
                event.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* For Sellers Section */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Built for Event Organizers</h2>
              <p className="text-white/60 text-lg mb-8">
                Powerful tools to create, manage, and grow your events. Track sales, manage bookings, and get paid
                faster with our comprehensive seller platform.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/5 rounded">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Real-time Analytics</h4>
                    <p className="text-sm text-white/60">Track sales, revenue, and attendance in real-time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/5 rounded">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Team Management</h4>
                    <p className="text-sm text-white/60">Add managers and collaborate with your team</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/5 rounded">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Secure Payouts</h4>
                    <p className="text-sm text-white/60">Fast and secure payment processing</p>
                  </div>
                </div>
              </div>
              <Link href="/apply-seller">
                <Button size="lg" className="gap-2">
                  Apply as Seller
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <Card className="p-8 bg-white/5 border-white/10 hover:border-white/30 transition-colors">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg">
                  <span className="text-white/60">Total Revenue</span>
                  <span className="text-2xl font-bold">KES 2.4M</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg">
                  <span className="text-white/60">Tickets Sold</span>
                  <span className="text-2xl font-bold">12,450</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg">
                  <span className="text-white/60">Active Events</span>
                  <span className="text-2xl font-bold">24</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-white/60 text-lg">Join our growing community of event lovers and organizers</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <p className="text-white/60">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">5K+</div>
              <p className="text-white/60">Events Hosted</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">98%</div>
              <p className="text-white/60">Customer Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-white/60">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-white/60 text-lg mb-8">
            Join thousands of users experiencing the future of event ticketing
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Create Account</Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Updated Header Component
function Header() {
  return (
    <header className="border-b border-white/10 sticky top-0 z-50 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="">
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
  )
}

// Footer Component
function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="h-5 w-5" />
              <span className="font-bold">LucoTicket</span>
            </div>
            <p className="text-sm text-white/60">
              East Africa's leading event ticketing platform. Discover, book, and experience unforgettable events.
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
  )
}