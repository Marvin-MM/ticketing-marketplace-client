"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Ticket, LayoutDashboard, Calendar, TrendingUp, DollarSign, Users, LogOut, Menu, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useUIStore } from "@/lib/store/uiStore"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface SellerLayoutProps {
  children: React.ReactNode
}

export function SellerLayout({ children }: SellerLayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  const navigation = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Campaigns", href: "/seller/campaigns", icon: Calendar },
    // { name: "Analytics", href: "/seller/analytics", icon: TrendingUp },
    { name: "Finance", href: "/seller/finance", icon: DollarSign },
    { name: "Managers", href: "/seller/managers", icon: Users },
  ]

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : "S"

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Link href="/seller/dashboard" className="flex items-center gap-2">

              <Image
                src="/logo.png"
                alt="LucoTicket"
                width={32}
                height={32}
                className="h-14 w-auto"
              />

            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Seller</span>
          </Link>

          <div className="flex-1" />

          {/* Create campaign button */}
          {/* <Button asChild>
            <Link href="/seller/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button> */}

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
                <Link href="/customer/dashboard">
                  <Ticket className="mr-2 h-4 w-4" />
                  Switch to Customer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transition-transform duration-300 lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
          style={{ top: "64px" }}
        >
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden" onClick={toggleSidebar} />
      )}
    </div>
  )
}
