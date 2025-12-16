// import { create } from "zustand"
// import { persist } from "zustand/middleware"
// import type { User } from "@/lib/types"

// interface AuthStore {
//   user: User | null
//   isAuthenticated: boolean
//   isLoading: boolean
//   setUser: (user: User | null) => void
//   setLoading: (loading: boolean) => void
//   logout: () => void
// }

// export const useAuthStore = create<AuthStore>()(
//   persist(
//     (set) => ({
//       user: null,
//       isAuthenticated: false,
//       isLoading: true,

//       setUser: (user) =>
//         set({
//           user,
//           isAuthenticated: !!user,
//           isLoading: false,
//         }),

//       setLoading: (loading) => set({ isLoading: loading }),

//       logout: () =>
//         set({
//           user: null,
//           isAuthenticated: false,
//           isLoading: false,
//         }),
//     }),
//     {
//       name: "auth-storage",
//       partialize: (state) => ({
//         user: state.user,
//         isAuthenticated: state.isAuthenticated,
//       }),
//     },
//   ),
// )


import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/lib/types"

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean // Track if store has been hydrated from localStorage
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  clearAuth: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () => {
        // Clear the store
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
        
        // Also clear from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage")
        }
      },

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Handle hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated()
        }
      },
    },
  ),
)

// Hook to wait for hydration before rendering auth-dependent UI
export function useAuthHydration() {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  return isHydrated
}