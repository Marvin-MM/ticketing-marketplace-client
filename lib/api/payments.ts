import apiClient from "./axios"
import type { Payment, ApiResponse } from "@/lib/types"

export interface InitializePaymentData {
  bookingId: string
  currency?: string
}

export const paymentsApi = {
  // Initialize payment
  initializePayment: async (paymentData: InitializePaymentData) => {
    const { data } = await apiClient.post<
      ApiResponse<{
        paymentId: string
        paymentLink: string
        reference: string
        amount: number
        currency: string
      }>
    >("/payments/initialize", {
      ...paymentData,
      currency: paymentData.currency || "UGX",
    })
    return data.data!
  },

  // Verify payment
  verifyPayment: async (reference: string) => {
    const { data } = await apiClient.get<ApiResponse<{ payment: Payment }>>(`/payments/verify/${reference}`)
    return data.data!.payment
  },

  // Get payment history
  getPaymentHistory: async (filters?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ payments: Payment[]; pagination: any }>>("/payments/history", {
      params: filters,
    })
    return data.data!
  },

  // Request refund
  requestRefund: async (paymentId: string, reason: string) => {
    const { data } = await apiClient.post<ApiResponse<{ refund: any }>>(`/payments/${paymentId}/refund`, { reason })
    return data.data!
  },
}
