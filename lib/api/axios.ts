// import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios"

// const BASE_URL = "http://localhost:5000/api/v1"
// // const BASE_URL = "https://ticketing-marketplace.onrender.com/api/v1"

// // Create axios instance
// export const apiClient: AxiosInstance = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true, // Important for cookie-based auth
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 30000, // 30 seconds
// })

// // Request interceptor
// apiClient.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     // You can add loading state here if needed
//     return config
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error)
//   },
// )

// // Response interceptor
// apiClient.interceptors.response.use(
//   (response) => {
//     return response
//   },
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

//     // Handle 401 Unauthorized - try to refresh token
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       // Don't retry if the failed request was already a refresh-token or logout request
//       const isAuthEndpoint = originalRequest.url?.includes("/auth/refresh-token") || 
//                             originalRequest.url?.includes("/auth/logout") ||
//                             originalRequest.url?.includes("/auth/login")
      
//       if (isAuthEndpoint) {
//         // Don't attempt to refresh for auth endpoints, just reject
//         if (typeof window !== "undefined" && !originalRequest.url?.includes("/auth/login")) {
//           // Clear any stored auth state
//           localStorage.removeItem("auth-storage")
//           window.location.href = "/login"
//         }
//         return Promise.reject(error)
//       }

//       originalRequest._retry = true

//       try {
//         // Attempt to refresh the session
//         await apiClient.post("/auth/refresh-token")

//         // Retry the original request
//         return apiClient(originalRequest)
//       } catch (refreshError) {
//         // Refresh failed, clear auth and redirect to login
//         if (typeof window !== "undefined") {
//           localStorage.removeItem("auth-storage")
//           window.location.href = "/login"
//         }
//         return Promise.reject(refreshError)
//       }
//     }

//     // Handle other errors - preserve status code and structure
//     const errorMessage = error.response?.data?.message || error.message || "An error occurred"
//     const errorStatus = error.response?.status

//     // Create a proper error object that preserves the status
//     const apiError = new Error(errorMessage) as any
//     apiError.status = errorStatus
//     apiError.response = error.response
//     apiError.errors = error.response?.data?.errors
//     apiError.originalError = error

//     return Promise.reject(apiError)
//   },
// )

// // Retry logic with exponential backoff
// export const retryRequest = async <T>(
//   requestFn: () => Promise<T>,
//   maxRetries = 3,
//   delay = 1000
// )
// : Promise<T> =>
// {
//   let lastError: any

//   for (let i = 0; i < maxRetries; i++) {
//     try {
//       return await requestFn();
//     } catch (error) {
//       lastError = error

//       // Don't retry on 4xx errors (client errors)
//       if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
//         throw error
//       }

//       // Wait before retrying (exponential backoff)
//       if (i < maxRetries - 1) {
//         await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
//       }
//     }
//   }

//   throw lastError
// }

// // Type for API responses
// interface ApiResponse<T = any> {
//   success: boolean
//   message?: string
//   data?: T
//   errors?: Array<{ field: string; message: string }>
// }

// export default apiClient


import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios"

// const BASE_URL = "http://localhost:5000/api/v1"
const BASE_URL = "https://ticketing-marketplace.onrender.com/api/v1"

// Global state to manage token refresh
let isRefreshing = false
let refreshSubscribers: Array<(error?: any) => void> = []

// Subscribe requests to wait for token refresh
function subscribeTokenRefresh(callback: (error?: any) => void) {
  refreshSubscribers.push(callback)
}

// Notify all waiting requests when refresh completes
function onRefreshComplete(error?: any) {
  refreshSubscribers.forEach(callback => callback(error))
  refreshSubscribers = []
}

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add loading state here if needed
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry if the failed request was already a refresh-token, logout, or login request
      const isAuthEndpoint = originalRequest.url?.includes("/auth/refresh-token") || 
                            originalRequest.url?.includes("/auth/logout") ||
                            originalRequest.url?.includes("/auth/login") ||
                            originalRequest.url?.includes("/auth/register")
      
      if (isAuthEndpoint) {
        console.log('[API] Auth endpoint failed, not retrying')
        // Don't attempt to refresh for auth endpoints, just reject
        if (typeof window !== "undefined" && !originalRequest.url?.includes("/auth/login")) {
          // Use dynamic import to avoid circular dependency
          import("@/lib/store/authStore").then(({ useAuthStore }) => {
            useAuthStore.getState().logout()
          })
          window.location.href = "/login?session_expired=true"
        }
        return Promise.reject(error)
      }

      originalRequest._retry = true

      // If not already refreshing, start the refresh process
      if (!isRefreshing) {
        isRefreshing = true
        console.log('[API] Token expired, attempting refresh...')

        try {
          // Attempt to refresh the session
          const { data } = await apiClient.post("/auth/refresh-token")
          
          console.log('[API] Token refreshed successfully')
          
          // Update auth store with new user data if available
          if (data?.data?.user) {
            // Use dynamic import to avoid circular dependency
            import("@/lib/store/authStore").then(({ useAuthStore }) => {
              useAuthStore.getState().setUser(data.data.user)
            })
          }
          
          isRefreshing = false
          
          // Notify all waiting requests that refresh succeeded
          onRefreshComplete()
          
          // Retry the original request
          return apiClient(originalRequest)
          
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError)
          isRefreshing = false
          
          // Notify all waiting requests that refresh failed
          onRefreshComplete(refreshError)
          
          // Refresh failed, clear auth and redirect to login
          if (typeof window !== "undefined") {
            // Use dynamic import to avoid circular dependency
            import("@/lib/store/authStore").then(({ useAuthStore }) => {
              useAuthStore.getState().logout()
            })
            window.location.href = "/login?session_expired=true"
          }
          return Promise.reject(refreshError)
        }
      }

      // If already refreshing, queue this request
      console.log('[API] Token refresh in progress, queuing request...')
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((error?: any) => {
          if (error) {
            reject(error)
          } else {
            // Retry the request after refresh completes
            resolve(apiClient(originalRequest))
          }
        })
      })
    }

    // Handle other errors - preserve status code and structure
    const errorMessage = error.response?.data?.message || error.message || "An error occurred"
    const errorStatus = error.response?.status

    // Create a proper error object that preserves the status
    const apiError = new Error(errorMessage) as any
    apiError.status = errorStatus
    apiError.response = error.response
    apiError.data = error.response?.data
    apiError.errors = error.response?.data?.errors
    apiError.originalError = error

    return Promise.reject(apiError)
  },
)

// Retry logic with exponential backoff
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error

      // Don't retry on 4xx errors (client errors)
      if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
        throw error
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError
}

// Type for API responses
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}

export default apiClient