import apiClient from "./axios"
import type { User, ApiResponse } from "@/lib/types"

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  role?: "CUSTOMER"
}

export interface SellerApplicationData {
  businessName: string
  businessType: "individual" | "company" | "organization" | "other"
  businessAddress: string
  businessPhone: string
  businessEmail: string
  taxId?: string
  businessDocuments?: string[]
  description?: string
  websiteUrl?: string
  socialMediaHandles?: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
}

export interface NewSellerApplicationData extends RegisterData, SellerApplicationData {}

// Manager Management Types
export interface Manager {
  id: string
  name: string
  email: string
  phone: string | null
  isActive: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_INVITE' | 'INVITE_EXPIRED'
  permissions: string[]
  lastActiveAt: string | null
  createdAt: string
  invitationExpiry: string | null
}

export interface CreateManagerData {
  name: string
  email: string
  phone?: string
  permissions?: string[]
}

export interface ManagerListResponse {
  managers: Manager[]
  count: number
}

export interface CreateManagerResponse {
  managerId: string
  name: string
  email: string
}

export interface DeactivateManagerResponse {
  managerId: string
  isActive: boolean
}

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials) => {
    try {
      const { data } = await apiClient.post<ApiResponse<{ user: User }>>(
        "/auth/login",
        credentials
      )
      return data.data!
    } catch (error: any) {
      console.error('[Auth API] Login failed:', error)
      throw error
    }
  },

  // Register
  register: async (userData: RegisterData) => {
    try {
      const { data } = await apiClient.post<ApiResponse<{ user: User }>>(
        "/auth/register",
        {
          ...userData,
          role: "CUSTOMER",
        }
      )
      return data.data!
    } catch (error: any) {
      console.error('[Auth API] Registration failed:', error)
      throw error
    }
  },

  // Google OAuth (redirect)
  getGoogleAuthUrl: () => {
    return `${apiClient.defaults.baseURL}/auth/google`
  },

  // Logout
  logout: async () => {
    try {
      const { data } = await apiClient.post<ApiResponse>("/auth/logout")
      return data
    } catch (error: any) {
      console.error('[Auth API] Logout failed:', error)
      // Don't throw on logout failure - we still want to clear local state
      return { success: false, message: 'Logout failed' }
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const { data } = await apiClient.post<ApiResponse<{ user: User }>>(
        "/auth/refresh-token"
      )
      
      // Return the full data object so interceptor can access user
      return data.data!
    } catch (error: any) {
      console.error('[Auth API] Token refresh failed:', error)
      throw error
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<{ user: User }>>(
        "/auth/profile"
      )
      return data.data!.user
    } catch (error: any) {
      console.error('[Auth API] Get profile failed:', error)
      throw error
    }
  },

  // Apply for seller account (new user)
  applySellerNew: async (applicationData: NewSellerApplicationData) => {
    try {
      const { data } = await apiClient.post<ApiResponse<{ user: User; application: any }>>(
        "/auth/apply-seller",
        applicationData
      )
      return data.data!
    } catch (error: any) {
      console.error('[Auth API] New seller application failed:', error)
      throw error
    }
  },

  // Apply for seller account (existing user)
  applySellerExisting: async (applicationData: SellerApplicationData) => {
    try {
      const { data } = await apiClient.post<ApiResponse<{ applicationStatus: string }>>(
        "/auth/seller-application",
        applicationData
      )
      return data.data!
    } catch (error: any) {
      console.error('[Auth API] Seller application failed:', error)
      throw error
    }
  },

  // Check application status
  getApplicationStatus: async () => {
    try {
      const { data } = await apiClient.get<
        ApiResponse<{ applicationStatus: string; sellerApplication: any }>
      >("/auth/application-status")
      return data.data!
    } catch (error: any) {
      console.error('[Auth API] Get application status failed:', error)
      throw error
    }
  },

  // === MANAGER MANAGEMENT ===

  // Create a new manager (send invitation)
  createManager: async (managerData: CreateManagerData) => {
    try {
      const { data } = await apiClient.post<ApiResponse<CreateManagerResponse>>(
        "/auth/create-manager",
        managerData
      )
      return data.data!
    } catch (error: any) {
      console.error('[Auth API] Create manager failed:', error)
      throw error
    }
  },

  // Get all managers for the current seller
  getSellerManagers: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<ManagerListResponse>>(
        "/auth/seller-managers"
      )
      return data.data!
    } catch (error: any) {
      console.error('[Auth API] Get managers failed:', error)
      throw error
    }
  },

  // Deactivate a manager
  deactivateManager: async (managerId: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<DeactivateManagerResponse>>(
        `/auth/deactivate-manager/${managerId}`
      )
      return data.data!
    } catch (error: any) {
      console.error('[Auth API] Deactivate manager failed:', error)
      throw error
    }
  },
}