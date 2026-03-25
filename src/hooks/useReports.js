import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi } from '@/api/reports.api'
import { remindersApi } from '@/api/reminders.api'
import { getApiError } from '@/api/axios'
import { useToast } from '@/components/ui/use-toast'

export function useReports(params) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: async () => {
      const { data } = await reportsApi.list(params)
      return data
    },
  })
}

export function useGenerateReport() {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await reportsApi.generate(payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] })
      toast({ title: 'Report generated!' })
    },
    onError: (err) => {
      toast({ title: 'Failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}

export function useReminders(params) {
  return useQuery({
    queryKey: ['reminders', params],
    queryFn: async () => {
      const { data } = await remindersApi.list(params)
      return data
    },
  })
}

export function useSendReminder() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (debtId) => {
      const { data } = await remindersApi.send(debtId)
      return data
    },
    onSuccess: () => {
      toast({ title: 'Reminder sent!', description: 'They will be notified by email.' })
    },
    onError: (err) => {
      toast({ title: 'Failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}
