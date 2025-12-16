import apiClient from "./axios"
import type { FinanceDashboard, Withdrawal, ApiResponse } from "@/lib/types"

export interface AddWithdrawalMethodData {
  method: "BANK_ACCOUNT" | "MOBILE_MONEY" | "PAYPAL"
  accountName: string
  accountNumber?: string
  bankName?: string
  bankCode?: string
  mobileProvider?: string
  mobileNumber?: string
  paypalEmail?: string
  setAsDefault?: boolean
}

export interface RequestWithdrawalData {
  amount: number
  methodId: string
}

export const financeApi = {
  // Get finance dashboard
  getDashboard: async () => {
    const { data } = await apiClient.get<ApiResponse<FinanceDashboard>>("/finance/dashboard")
    return data.data!
  },

  // Add withdrawal method
  addWithdrawalMethod: async (methodData: AddWithdrawalMethodData) => {
    const { data } = await apiClient.post<ApiResponse<{ methodId: string }>>("/finance/withdrawal-methods", methodData)
    return data.data!
  },

    // Remove withdrawal method
  removeWithdrawalMethod: async (methodId: string) => {
    const { data } = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/finance/withdrawal-methods/${methodId}`)
    return data.data!
  },

  // Request withdrawal
  requestWithdrawal: async (withdrawalData: RequestWithdrawalData) => {
    const { data } = await apiClient.post<ApiResponse<{ withdrawalId: string; status: string }>>(
      "/finance/withdrawals",
      withdrawalData,
    )
    return data.data!
  },

  // Get withdrawal history
  getWithdrawals: async (filters?: { status?: string }) => {
    const { data } = await apiClient.get<ApiResponse<{ withdrawals: Withdrawal[] }>>("/finance/withdrawals", {
      params: filters,
    })
    return data.data!
  },

  // Get transaction history
  getTransactions: async (filters?: { type?: string; startDate?: string; endDate?: string }) => {
    const { data } = await apiClient.get<ApiResponse<{ transactions: any[] }>>("/finance/transactions", {
      params: filters,
    })
    return data.data!
  },

  // Get revenue analytics
  getAnalytics: async (params?: { period?: string; groupBy?: string }) => {
    const { data } = await apiClient.get<ApiResponse<any>>("/finance/analytics", { params })
    return data.data!
  },
}
