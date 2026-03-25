import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expensesApi } from '@/api/expenses.api'
import { getApiError } from '@/api/axios'
import { useToast } from '@/components/ui/use-toast'

export function useGroupDebts(groupId, params) {
  return useQuery({
    queryKey: ['debts', groupId, params],
    queryFn: async () => {
      const { data } = await expensesApi.listDebts(groupId, params)
      return data
    },
    enabled: !!groupId,
  })
}

export function useMyBalance(groupId) {
  return useQuery({
    queryKey: ['balance', groupId],
    queryFn: async () => {
      const { data } = await expensesApi.getMyBalance(groupId)
      return data.data
    },
    enabled: !!groupId,
  })
}

export function useSettleDebt(groupId) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (debtId) => {
      const { data } = await expensesApi.settleDebt(groupId, debtId)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts', groupId] })
      qc.invalidateQueries({ queryKey: ['balance', groupId] })
      toast({ title: 'Debt settled!', description: 'Balance updated.' })
    },
    onError: (err) => {
      toast({ title: 'Failed to settle', description: getApiError(err), variant: 'destructive' })
    },
  })
}
