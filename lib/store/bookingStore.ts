import { create } from "zustand"
import type { IssuanceType } from "@/lib/types"

interface BookingDetails {
  campaignId: string
  campaignTitle?: string
  ticketType: string
  quantity: number
  issuanceType: IssuanceType
  price: number
  totalAmount: number
}

interface BookingStore {
  currentBooking: Partial<BookingDetails> | null
  setBookingDetails: (details: Partial<BookingDetails>) => void
  updateBookingDetails: (updates: Partial<BookingDetails>) => void
  clearBooking: () => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  currentBooking: null,

  setBookingDetails: (details) => set({ currentBooking: details }),

  updateBookingDetails: (updates) =>
    set((state) => ({
      currentBooking: state.currentBooking ? { ...state.currentBooking, ...updates } : updates,
    })),

  clearBooking: () => set({ currentBooking: null }),
}))
