"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/authStore"
import { authApi } from "@/lib/api/auth"
import { queryKeys } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user, setUser, logout: clearAuth, setLoading } = useAuthStore()

  // Get current user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: authApi.getProfile,
    enabled: !!user,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false, // Don't refetch on mount to avoid immediate logout
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user)
      queryClient.setQueryData(queryKeys.auth.profile, data.user)

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      })

      // Redirect based on role
      if (data.user.role === "SELLER") {
        router.push("/seller/dashboard")
      } else {
        router.push("/customer/dashboard")
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setUser(data.user)
      queryClient.setQueryData(queryKeys.auth.profile, data.user)

      toast({
        title: "Account created!",
        description: "Welcome to the platform.",
      })

      router.push("/customer/dashboard")
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth()
      queryClient.clear()

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })

      router.push("/login")
    },
    onError: (error: any) => {
      // Even if logout API fails, clear local state
      console.error("Logout API error:", error)
      clearAuth()
      queryClient.clear()

      toast({
        title: "Logged out",
        description: "You have been logged out.",
      })

      router.push("/login")
    },
  })

  return {
    user: profile || user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  }
}
