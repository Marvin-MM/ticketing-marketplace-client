"use client"

import type React from "react"
import { SellerLayout } from "@/components/seller/seller-layout"
import { useSessionManager } from "@/lib/hooks/useSessionManager"
import { useRealtimeBookings } from "@/lib/hooks/useRealtimeBookings"

export default function SellerRootLayout({ children }: { children: React.ReactNode }) {
  useSessionManager()
  useRealtimeBookings()

  return <SellerLayout>{children}</SellerLayout>
}
