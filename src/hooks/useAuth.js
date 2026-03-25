import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'
import { getApiError } from '@/api/axios'
import { useToast } from '@/components/ui/use-toast'

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await authApi.getMe()
      return data.data
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })
}

export function useLogin() {
  const { setAuth } = useAuthStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await authApi.login(credentials)
      return data
    },
    onSuccess: async (data) => {
      const { access, refresh } = data
      setAuth(null, access, refresh)
      // Fetch user profile
      try {
        const { data: meData } = await authApi.getMe()
        useAuthStore.getState().updateUser(meData.data)
        qc.setQueryData(['me'], meData.data)
      } catch {}
      navigate('/dashboard')
    },
    onError: (err) => {
      toast({ title: 'Login failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}

export function useRegister() {
  const { toast } = useToast()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await authApi.register(payload)
      return data
    },
    onSuccess: () => {
      toast({ title: 'Account created!', description: 'Please log in to continue.' })
      navigate('/login')
    },
    onError: (err) => {
      toast({ title: 'Registration failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}

export function useLogout() {
  const { logout, refreshToken } = useAuthStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) await authApi.logout(refreshToken).catch(() => {})
    },
    onSettled: () => {
      logout()
      qc.clear()
      navigate('/login')
      toast({ title: 'Logged out', description: 'See you next time!' })
    },
  })
}

export function useUpdateProfile() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)

  return useMutation({
    mutationFn: async (data) => {
      const res = await authApi.updateMe(data)
      return res.data.data
    },
    onSuccess: (user) => {
      updateUser(user)
      qc.setQueryData(['me'], user)
      toast({ title: 'Profile updated' })
    },
    onError: (err) => {
      toast({ title: 'Update failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}

export function useChangePassword() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data) => {
      await authApi.changePassword(data)
    },
    onSuccess: () => {
      toast({ title: 'Password changed successfully' })
    },
    onError: (err) => {
      toast({ title: 'Failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}
