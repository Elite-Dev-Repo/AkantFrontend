import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expensesApi } from '@/api/expenses.api'
import { getApiError } from '@/api/axios'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'

export function useGroupExpenses(groupId, params) {
  return useQuery({
    queryKey: ['expenses', groupId, params],
    queryFn: async () => {
      const { data } = await expensesApi.listByGroup(groupId, params)
      return data
    },
    enabled: !!groupId,
  })
}

export function useAllExpenses(params) {
  return useQuery({
    queryKey: ['expenses', 'all', params],
    queryFn: async () => {
      const { data } = await expensesApi.listAll(params)
      return data
    },
  })
}

export function useCreateExpense(groupId) {
  const qc = useQueryClient()
  const { toast } = useToast()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await expensesApi.create(groupId, payload)
      return data.data
    },
    onSuccess: (expense) => {
      qc.invalidateQueries({ queryKey: ['expenses', groupId] })
      qc.invalidateQueries({ queryKey: ['debts', groupId] })
      qc.invalidateQueries({ queryKey: ['balance', groupId] })
      toast({ title: 'Expense added!', description: `"${expense.title}" has been split.` })
      navigate(`/groups/${groupId}`)
    },
    onError: (err) => {
      toast({ title: 'Failed to add expense', description: getApiError(err), variant: 'destructive' })
    },
  })
}

export function useDeleteExpense(groupId) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (expenseId) => {
      await expensesApi.delete(groupId, expenseId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', groupId] })
      qc.invalidateQueries({ queryKey: ['debts', groupId] })
      toast({ title: 'Expense deleted' })
    },
    onError: (err) => {
      toast({ title: 'Failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}

export function useMarkSplitPaid(groupId) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ expenseId, splitId }) => {
      const { data } = await expensesApi.markSplitPaid(groupId, expenseId, splitId)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', groupId] })
      qc.invalidateQueries({ queryKey: ['debts', groupId] })
      toast({ title: 'Marked as paid' })
    },
    onError: (err) => {
      toast({ title: 'Failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}
