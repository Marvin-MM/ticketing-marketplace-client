import apiClient from "./axios"
import type { Booking, BookingFilters, ApiResponse, IssuanceType } from "@/lib/types"

export interface CreateBookingData {
  campaignId: string
  ticketType: string
  quantity: number
  issuanceType: IssuanceType
}

export const bookingsApi = {
  // Create booking
  createBooking: async (bookingData: CreateBookingData) => {
    const { data } = await apiClient.post<ApiResponse<{ booking: Booking }>>("/bookings", bookingData)
    return data.data!.booking
  },

  // Get user's bookings
  getMyBookings: async (filters?: BookingFilters) => {
    const { data } = await apiClient.get<ApiResponse<{ bookings: Booking[]; pagination: any }>>(
      "/bookings/my-bookings",
      { params: filters },
    )
    return data.data!
  },

  // Get booking by ID
  getBookingById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<{ booking: Booking }>>(`/bookings/${id}`)
    return data.data!.booking
  },

  // Cancel booking
  cancelBooking: async (id: string, reason?: string) => {
    const { data } = await apiClient.post<ApiResponse>(`/bookings/${id}/cancel`, { reason })
    return data
  },

  // Get bookings by campaign (seller only)
  getByCampaign: async (campaignId: string) => {
    const { data } = await apiClient.get<ApiResponse<{ bookings: Booking[] }>>(
      `/bookings/campaign/${campaignId}`,
    )
    return data.data!.bookings
  },

  // Get campaign booking stats (seller only)
  getCampaignStats: async (campaignId: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/bookings/campaign/${campaignId}/stats`)
    return data.data!
  },
}
