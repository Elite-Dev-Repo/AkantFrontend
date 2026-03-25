import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsApi } from '@/api/groups.api'
import { getApiError } from '@/api/axios'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'

export function useGroups(params) {
  return useQuery({
    queryKey: ['groups', params],
    queryFn: async () => {
      const { data } = await groupsApi.list(params)
      return data
    },
  })
}

export function useGroup(id) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const { data } = await groupsApi.get(id)
      return data.data
    },
    enabled: !!id,
  })
}

export function useGroupMembers(id) {
  return useQuery({
    queryKey: ['groups', id, 'members'],
    queryFn: async () => {
      const { data } = await groupsApi.listMembers(id)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await groupsApi.create(payload)
      return data.data
    },
    onSuccess: (group) => {
      qc.invalidateQueries({ queryKey: ['groups'] })
      toast({ title: 'Group created!', description: `"${group.name}" is ready.` })
      navigate(`/groups/${group.id}`)
    },
    onError: (err) => {
      toast({ title: 'Failed to create group', description: getApiError(err), variant: 'destructive' })
    },
  })
}

export function useUpdateGroup(id) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await groupsApi.update(id, payload)
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', id] })
      toast({ title: 'Group updated' })
    },
    onError: (err) => {
      toast({ title: 'Update failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}

export function useSendInvite(groupId) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (email) => {
      const { data } = await groupsApi.sendInvite(groupId, email)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'invites'] })
      toast({ title: 'Invite sent!', description: 'They will receive an email shortly.' })
    },
    onError: (err) => {
      toast({ title: 'Invite failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}

export function useAcceptInvite() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (token) => {
      const { data } = await groupsApi.acceptInvite(token)
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['groups'] })
      toast({ title: 'Joined group!', description: 'Welcome to the group.' })
      navigate('/groups')
    },
    onError: (err) => {
      toast({ title: 'Failed to accept invite', description: getApiError(err), variant: 'destructive' })
    },
  })
}

export function useRemoveMember(groupId) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (userId) => {
      await groupsApi.removeMember(groupId, userId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'members'] })
      toast({ title: 'Member removed' })
    },
    onError: (err) => {
      toast({ title: 'Failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}
