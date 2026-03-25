import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '@/api/payments.api'
import { getApiError } from '@/api/axios'
import { useToast } from '@/components/ui/use-toast'

export function usePayments(params) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      const { data } = await paymentsApi.list(params)
      return data
    },
  })
}

export function useInitiatePayment() {
  const { toast } = useToast()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (debtId) => {
      const { data } = await paymentsApi.initiate(debtId)
      return data
    },
    onSuccess: (data) => {
      // Redirect to Paystack checkout
      if (data.authorization_url) {
        window.open(data.authorization_url, '_blank')
      }
    },
    onError: (err) => {
      toast({ title: 'Payment failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}

export function useVerifyPayment() {
  const { toast } = useToast()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (reference) => {
      const { data } = await paymentsApi.verify(reference)
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['debts'] })
      qc.invalidateQueries({ queryKey: ['balance'] })
      if (data.data?.status === 'success') {
        toast({ title: 'Payment confirmed!', description: 'Debt has been settled.' })
      } else {
        toast({ title: 'Payment pending', description: 'Status: ' + data.data?.status, variant: 'destructive' })
      }
    },
    onError: (err) => {
      toast({ title: 'Verification failed', description: getApiError(err), variant: 'destructive' })
    },
  })
}
