"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/store/authStore"
import { initializeSocket, disconnectSocket, getSocket } from "@/lib/socket"

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = initializeSocket(token)

      return () => {
        disconnectSocket()
      }
    }
  }, [isAuthenticated, token])

  return getSocket()
}
