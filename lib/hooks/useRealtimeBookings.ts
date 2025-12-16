"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useSocket } from "./useSocket"
import { onBookingUpdate, onNewBooking, offBookingUpdate, offNewBooking } from "@/lib/socket"
import { queryKeys } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"

export function useRealtimeBookings(campaignId?: string) {
  const socket = useSocket()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    if (!socket) return

    const handleBookingUpdate = (data: any) => {
      console.log("[v0] Booking updated:", data)

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list() })
      if (data.campaignId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.byCampaign(data.campaignId) })
      }
      if (data.bookingId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(data.bookingId) })
      }

      toast({
        title: "Booking Updated",
        description: `Booking ${data.bookingReference} has been updated`,
      })
    }

    const handleNewBooking = (data: any) => {
      console.log("[v0] New booking:", data)

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list() })
      if (data.campaignId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.byCampaign(data.campaignId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(data.campaignId) })
      }

      toast({
        title: "New Booking",
        description: `New booking received for ${data.campaignName}`,
      })
    }

    onBookingUpdate(handleBookingUpdate)
    onNewBooking(handleNewBooking)

    return () => {
      offBookingUpdate(handleBookingUpdate)
      offNewBooking(handleNewBooking)
    }
  }, [socket, queryClient, toast])
}
