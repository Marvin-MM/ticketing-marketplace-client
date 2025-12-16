import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export const initializeSocket = (token: string) => {
  if (socket?.connected) {
    return socket
  }

  socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  })

  socket.on("connect", () => {
    console.log("[v0] Socket connected:", socket?.id)
  })

  socket.on("disconnect", (reason) => {
    console.log("[v0] Socket disconnected:", reason)
  })

  socket.on("connect_error", (error) => {
    console.error("[v0] Socket connection error:", error)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket

// Event listeners
export const onBookingUpdate = (callback: (data: any) => void) => {
  socket?.on("booking:updated", callback)
}

export const onNewBooking = (callback: (data: any) => void) => {
  socket?.on("booking:new", callback)
}

export const onCampaignUpdate = (callback: (data: any) => void) => {
  socket?.on("campaign:updated", callback)
}

export const offBookingUpdate = (callback: (data: any) => void) => {
  socket?.off("booking:updated", callback)
}

export const offNewBooking = (callback: (data: any) => void) => {
  socket?.off("booking:new", callback)
}

export const offCampaignUpdate = (callback: (data: any) => void) => {
  socket?.off("campaign:updated", callback)
}

// Join/leave rooms
export const joinCampaignRoom = (campaignId: string) => {
  socket?.emit("join:campaign", campaignId)
}

export const leaveCampaignRoom = (campaignId: string) => {
  socket?.emit("leave:campaign", campaignId)
}
