import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setTokens, clearTokens } from '@/api/axios'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken)
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },

      updateUser: (user) => set({ user }),

      logout: () => {
        clearTokens()
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },

      hydrate: () => {
        const access = localStorage.getItem('access_token')
        const refresh = localStorage.getItem('refresh_token')
        if (access && refresh) {
          set({ accessToken: access, refreshToken: refresh, isAuthenticated: true })
          setTokens(access, refresh)
        }
      },
    }),
    {
      name: 'bills-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
