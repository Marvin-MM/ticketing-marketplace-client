// "use client"

// import { useEffect, useRef } from "react"
// import { useAuthStore } from "@/lib/store/authStore"
// import { authApi } from "@/lib/api/auth"
// import { useQueryClient } from "@tanstack/react-query"
// import { queryKeys } from "@/lib/queryClient"

// export function useSessionManager() {
//   const { user, setUser, setLoading } = useAuthStore()
//   const queryClient = useQueryClient()
//   const isInitialized = useRef(false)
//   const userIdRef = useRef<string | null>(null)

//   useEffect(() => {
//     // Get current user ID to track changes
//     const currentUserId = user?._id || user?.id || null
    
//     // If user hasn't changed, don't re-initialize
//     if (isInitialized.current && userIdRef.current === currentUserId) {
//       return
//     }
    
//     // If user logged out, reset initialization
//     if (!currentUserId && isInitialized.current) {
//       isInitialized.current = false
//       userIdRef.current = null
//       setLoading(false)
//       return
//     }

//     let refreshInterval: NodeJS.Timeout | null = null
//     let isMounted = true

//     const checkSession = async () => {
//       // Only check session if we think we have a user
//       if (!user) {
//         setLoading(false)
//         return
//       }

//       try {
//         const fetchedUser = await authApi.getProfile()
//         if (isMounted && fetchedUser) {
//           setUser(fetchedUser)
//           queryClient.setQueryData(queryKeys.auth.profile, fetchedUser)
//           console.log("Session verified successfully")
//         }
//       } catch (error: any) {
//         console.error("Session check failed:", error)
        
//         // Only clear session if it's a 401 (unauthorized) error
//         // Don't clear on network errors or other temporary issues
//         const isUnauthorized = error?.status === 401 || error?.response?.status === 401
        
//         if (isMounted && isUnauthorized) {
//           console.log("Session expired (401), clearing user")
//           setUser(null)
//           queryClient.clear()
//         } else {
//           console.log("Session check failed but keeping user logged in (non-401 error)")
//         }
//       }
//     }

//     const refreshSession = async () => {
//       // Critical: Only refresh if user is logged in
//       if (!user) {
//         console.log("No user found, skipping token refresh")
//         return
//       }

//       try {
//         const data = await authApi.refreshToken()
//         if (isMounted && data?.user) {
//           setUser(data.user)
//           queryClient.setQueryData(queryKeys.auth.profile, data.user)
//           console.log("Token refreshed successfully")
//         }
//       } catch (error: any) {
//         console.error("Session refresh failed:", error)
        
//         // Only clear session if it's a 401 (unauthorized) error
//         // This means the refresh token itself is invalid/expired
//         const isUnauthorized = error?.status === 401 || error?.response?.status === 401
        
//         if (isMounted && isUnauthorized) {
//           console.log("Refresh token expired (401), clearing user")
//           setUser(null)
//           queryClient.clear()
//           // Redirect to login
//           if (typeof window !== "undefined") {
//             window.location.href = "/login"
//           }
//         } else {
//           console.log("Token refresh failed but keeping user logged in (non-401 error)")
//         }
//       }
//     }

//     // Only initialize session management if user exists
//     if (user && currentUserId) {
//       isInitialized.current = true
//       userIdRef.current = currentUserId
      
//       console.log(`Session manager initialized for user: ${currentUserId}`)

//       // Refresh token every 10 minutes (session expires at 15 minutes)
//       refreshInterval = setInterval(refreshSession, 10 * 60 * 1000)
//       console.log("Session manager refresh interval started")
      
//       setLoading(false)
//     } else {
//       setLoading(false)
//       console.log("No user found, session manager inactive")
//     }

//     // Cleanup function
//     return () => {
//       isMounted = false
//       if (refreshInterval) {
//         clearInterval(refreshInterval)
//         refreshInterval = null
//         console.log("Session manager cleanup: interval cleared")
//       }
//     }
//   }, [user, setUser, setLoading, queryClient]) // Re-added dependencies to track user changes
// }


"use client"

import { useEffect, useRef, useCallback } from "react"
import { useAuthStore } from "@/lib/store/authStore"
import { authApi } from "@/lib/api/auth"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryClient"

// Configuration constants
const REFRESH_BUFFER_MS = 2 * 60 * 1000 // Refresh 2 minutes before expiry
const SESSION_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes
const REFRESH_INTERVAL_MS = SESSION_EXPIRY_MS - REFRESH_BUFFER_MS // 13 minutes
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 5000

interface SessionState {
  lastRefreshTime: number
  retryCount: number
  isRefreshing: boolean
}

export function useSessionManager() {
  const { user, setUser, logout, setLoading } = useAuthStore()
  const queryClient = useQueryClient()
  
  // Refs to track state without causing re-renders
  const isInitialized = useRef(false)
  const userIdRef = useRef<string | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sessionStateRef = useRef<SessionState>({
    lastRefreshTime: Date.now(),
    retryCount: 0,
    isRefreshing: false
  })
  const isMountedRef = useRef(true)

  // Cleanup function to clear intervals and timeouts
  const cleanup = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
      console.log("[Session] Refresh interval cleared")
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
      console.log("[Session] Retry timeout cleared")
    }
  }, [])

  // Handle session expiry/logout
  const handleSessionExpired = useCallback(() => {
    if (!isMountedRef.current) return
    
    console.log("[Session] Session expired, logging out")
    logout() // Use the store's logout method
    queryClient.clear()
    cleanup()
    
    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login?session_expired=true"
    }
  }, [logout, queryClient, cleanup])

  // Verify current session is valid
  const verifySession = useCallback(async (): Promise<boolean> => {
    if (!user || !isMountedRef.current) return false

    try {
      console.log("[Session] Verifying session...")
      const fetchedUser = await authApi.getProfile()
      
      if (isMountedRef.current && fetchedUser) {
        setUser(fetchedUser)
        queryClient.setQueryData(queryKeys.auth.profile, fetchedUser)
        console.log("[Session] Session verified successfully")
        return true
      }
      return false
    } catch (error: any) {
      console.error("[Session] Verification failed:", error)
      
      const isUnauthorized = error?.status === 401 || error?.response?.status === 401
      
      if (isUnauthorized) {
        handleSessionExpired()
        return false
      }
      
      // For network errors, assume session is still valid
      console.log("[Session] Verification failed (network error), assuming valid")
      return true
    }
  }, [user, setUser, queryClient, handleSessionExpired])

  // Refresh authentication token
  const refreshSession = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent refresh attempts
    if (sessionStateRef.current.isRefreshing) {
      console.log("[Session] Refresh already in progress, skipping")
      return false
    }

    // Only refresh if user is logged in
    if (!user || !isMountedRef.current) {
      console.log("[Session] No user found, skipping token refresh")
      return false
    }

    sessionStateRef.current.isRefreshing = true

    try {
      console.log("[Session] Refreshing authentication token...")
      const data = await authApi.refreshToken()
      
      if (isMountedRef.current && data?.user) {
        setUser(data.user)
        queryClient.setQueryData(queryKeys.auth.profile, data.user)
        sessionStateRef.current.lastRefreshTime = Date.now()
        sessionStateRef.current.retryCount = 0
        console.log("[Session] Token refreshed successfully")
        return true
      }
      return false
    } catch (error: any) {
      console.error("[Session] Token refresh failed:", error)
      
      const isUnauthorized = error?.status === 401 || error?.response?.status === 401
      
      if (isUnauthorized) {
        handleSessionExpired()
        return false
      }
      
      // Handle retry logic for network errors
      sessionStateRef.current.retryCount++
      
      if (sessionStateRef.current.retryCount >= MAX_RETRY_ATTEMPTS) {
        console.error("[Session] Max refresh retry attempts reached")
        sessionStateRef.current.retryCount = 0
      } else {
        console.log(`[Session] Retry ${sessionStateRef.current.retryCount}/${MAX_RETRY_ATTEMPTS} in ${RETRY_DELAY_MS/1000}s`)
        // Retry after delay
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            refreshSession()
          }
        }, RETRY_DELAY_MS)
      }
      
      return false
    } finally {
      sessionStateRef.current.isRefreshing = false
    }
  }, [user, setUser, queryClient, handleSessionExpired])

  // Initialize session management
  useEffect(() => {
    isMountedRef.current = true
    const currentUserId = user?._id || user?.id || null
    
    // If user hasn't changed, don't re-initialize
    if (isInitialized.current && userIdRef.current === currentUserId) {
      return
    }
    
    // If user logged out, reset initialization
    if (!currentUserId && isInitialized.current) {
      console.log("[Session] User logged out, cleaning up")
      isInitialized.current = false
      userIdRef.current = null
      cleanup()
      setLoading(false)
      return
    }

    // Initialize session for logged-in user
    const initializeSession = async () => {
      if (!user || !currentUserId) {
        setLoading(false)
        console.log("[Session] No user to initialize")
        return
      }

      console.log(`[Session] Initializing for user: ${currentUserId}`)
      
      // First, verify the current session is valid
      const isValid = await verifySession()
      
      if (!isValid) {
        console.log("[Session] Initial verification failed")
        setLoading(false)
        return
      }

      // Mark as initialized
      isInitialized.current = true
      userIdRef.current = currentUserId
      sessionStateRef.current.lastRefreshTime = Date.now()

      // Set up automatic token refresh
      refreshIntervalRef.current = setInterval(() => {
        console.log("[Session] Scheduled refresh triggered")
        refreshSession()
      }, REFRESH_INTERVAL_MS)
      
      console.log(`[Session] Auto-refresh every ${REFRESH_INTERVAL_MS / 1000 / 60} minutes`)
      setLoading(false)
    }

    initializeSession()

    // Cleanup on unmount or user change
    return () => {
      console.log("[Session] Cleaning up effect")
      isMountedRef.current = false
      cleanup()
    }
  }, [user, setLoading, verifySession, refreshSession, cleanup])

  // Handle visibility change to refresh token when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        const timeSinceLastRefresh = Date.now() - sessionStateRef.current.lastRefreshTime
        
        // If it's been more than half the session time, refresh proactively
        if (timeSinceLastRefresh > SESSION_EXPIRY_MS / 2) {
          console.log("[Session] User returned after long absence, refreshing")
          refreshSession()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, refreshSession])

  // Optional: Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (user) {
        console.log("[Session] Connection restored, verifying session")
        verifySession()
      }
    }

    window.addEventListener('online', handleOnline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [user, verifySession])
}