import apiClient from "./axios"
import type { Campaign, CampaignFilters, ApiResponse } from "@/lib/types"

export const campaignsApi = {
  // Get all campaigns (public)
  getCampaigns: async (filters?: CampaignFilters) => {
    const { data } = await apiClient.get<ApiResponse<{ campaigns: Campaign[]; pagination: any }>>("/campaigns", {
      params: filters,
    })
    return data.data!
  },

  // Get featured campaigns
  getFeatured: async (limit = 10) => {
    const { data } = await apiClient.get<ApiResponse<{ campaigns: Campaign[] }>>("/campaigns/featured", {
      params: { limit },
    })
    return data.data!
  },

  // Get search suggestions
  getSuggestions: async (query: string) => {
    const { data } = await apiClient.get<ApiResponse<{ suggestions: string[] }>>("/campaigns/suggestions", {
      params: { q: query },
    })
    return data.data!
  },

  // Get campaign by ID
  getCampaignById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<{ campaign: Campaign }>>(`/campaigns/${id}`)
    return data.data!.campaign
  },

  // Create campaign (seller only)
  createCampaign: async (campaignData: Partial<Campaign>) => {
    const { data } = await apiClient.post<ApiResponse<{ campaign: Campaign }>>("/campaigns", campaignData)
    return data.data!.campaign
  },

  // Update campaign (seller only)
  updateCampaign: async (id: string, updates: Partial<Campaign>) => {
    const { data } = await apiClient.put<ApiResponse<{ campaign: Campaign }>>(`/campaigns/${id}`, updates)
    return data.data!.campaign
  },

  // Delete campaign (seller only)
  deleteCampaign: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse>(`/campaigns/${id}`)
    return data
  },

  // Get seller's campaigns
  getMyCampaigns: async (filters?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await apiClient.get<ApiResponse<{ campaigns: Campaign[]; pagination: any }>>(
      "/campaigns/seller/my-campaigns",
      { params: filters },
    )
    return data.data!
  },

  // Update campaign status
  updateCampaignStatus: async (id: string, status: string) => {
    const { data } = await apiClient.patch<ApiResponse<{ campaign: Campaign }>>(`/campaigns/${id}/status`, { status })
    return data.data!.campaign
  },
}
