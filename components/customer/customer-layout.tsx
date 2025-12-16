"use client"

import type React  from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tickets, Home, CreditCard, User, LogOut, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/hooks/useAuth"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface CustomerLayoutProps {
  children: React.ReactNode
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [scrollingUp, setScrollingUp] = useState(false)

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Detect scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setScrollingUp(true)
      } else if (currentScrollY < lastScrollY) {
        setScrollingUp(false)
      }
      
      // Add shadow effect when scrolled
      setScrolled(currentScrollY > 10)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])
  const navigation = [
    { name: "Dashboard", href: "/customer/dashboard", icon: Home },
    // { name: "Explore Events", href: "/customer/events", icon: Calendar },
    { name: "My Bookings", href: "/customer/bookings", icon: CreditCard },
    { name: "My Tickets", href: "/customer/tickets", icon: Tickets },
  ]

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : "U"

  return (
    <div className="min-h-screen bg-background">
      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
          {/* Logo */}
          <Link href="/customer/dashboard" className="flex items-center gap-2 shrink-0">
            <Link href="/" className="flex items-center text-white hover:text-white/90 transition-colors">
              <Image
                src="/logo.png"
                alt="LucoTicket"
                width={32}
                height={32}
                className="h-14 w-auto"
              />
            </Link>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search events..." className="pl-9 h-9 bg-muted/50" />
            </div>
          </div>

          <div className="flex-1" />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profilePicture} alt={user?.firstName} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/customer/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              {(user?.role === "seller" || user?.role === "manager") && (
                <DropdownMenuItem asChild>
                  <Link href="/seller/dashboard">
                    <Tickets className="mr-2 h-4 w-4" />
                    Switch to Seller
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Secondary navigation bar with smart scroll behavior */}
      <nav className={cn(
        "sticky top-16 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300",
        mounted && scrolled && "shadow-sm"
      )}>
        <div className="px-4 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              // Only apply scroll-based logic after mount to avoid hydration mismatch
              const showIcon = !mounted || !scrolled || !scrollingUp
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-2 px-4 py-3.5 md:text-sm text-xs font-medium transition-all duration-300 whitespace-nowrap rounded-t-lg",
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {/* Icon with smooth transition */}
                  <item.icon className={cn(
                    "h-4 transition-all duration-300 ease-in-out",
                    mounted && scrolled && scrollingUp ? "w-0 opacity-0 -mr-2" : "w-4 opacity-100 mr-0",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  
                  <span className="relative z-10">{item.name}</span>
                  
                  {/* Active indicator - bottom border */}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 transition-all duration-300 rounded-full",
                      isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-30 group-hover:scale-x-100"
                    )}
                  />
                  
                  {/* Hover background glow */}
                  {mounted && isActive && (
                    <span className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-t-lg" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="p-4 lg:p-8">{children}</main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
