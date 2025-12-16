import { QueryClient, type DefaultOptions } from "@tanstack/react-query"

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 0,
  },
}

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

// Query key factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    user: ["auth", "user"] as const,
    profile: ["auth", "profile"] as const,
    applicationStatus: ["auth", "application-status"] as const,
  },

  // Campaigns
  campaigns: {
    all: ["campaigns"] as const,
    list: (filters?: any) => ["campaigns", "list", filters] as const,
    detail: (id: string) => ["campaigns", "detail", id] as const,
    featured: (limit?: number) => ["campaigns", "featured", limit] as const,
    suggestions: (query: string) => ["campaigns", "suggestions", query] as const,
    seller: (filters?: any) => ["campaigns", "seller", filters] as const,
    analytics: (id: string, params?: any) => ["campaigns", "analytics", id, params] as const,
  },

  // Bookings
  bookings: {
    all: ["bookings"] as const,
    list: (filters?: any) => ["bookings", "list", filters] as const,
    myBookings: (filters?: any) => ["bookings", "my-bookings", filters] as const,
    detail: (id: string) => ["bookings", "detail", id] as const,
    byCampaign: (campaignId: string) => ["bookings", "by-campaign", campaignId] as const,
    campaignStats: (campaignId: string) => ["bookings", "campaign-stats", campaignId] as const,
  },

  // Payments
  payments: {
    all: ["payments"] as const,
    history: (filters?: any) => ["payments", "history", filters] as const,
    verify: (reference: string) => ["payments", "verify", reference] as const,
  },

  // Finance
  finance: {
    dashboard: ["finance", "dashboard"] as const,
    transactions: (filters?: any) => ["finance", "transactions", filters] as const,
    withdrawals: (filters?: any) => ["finance", "withdrawals", filters] as const,
    analytics: (params?: any) => ["finance", "analytics", params] as const,
  },
}
