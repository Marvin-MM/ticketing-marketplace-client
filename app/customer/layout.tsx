"use client"

import type React from "react"
import { CustomerLayout } from "@/components/customer/customer-layout"
import { useSessionManager } from "@/lib/hooks/useSessionManager"
import { useRealtimeBookings } from "@/lib/hooks/useRealtimeBookings"

export default function CustomerRootLayout({ children }: { children: React.ReactNode }) {
  useSessionManager()
  useRealtimeBookings()

  return <CustomerLayout>{children}</CustomerLayout>
}
