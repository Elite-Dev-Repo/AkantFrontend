import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Minus, Receipt } from 'lucide-react'
import { useGroup, useGroupMembers } from '@/hooks/useGroups'
import { useCreateExpense } from '@/hooks/useExpenses'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/forms/FormField'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserAvatar } from '@/components/ui/avatar'
import { PageLoader } from '@/components/ui/helpers'
import { CATEGORIES } from '@/lib/format'
import { cn } from '@/lib/utils'

const SPLIT_TYPES = [
  { value: 'equal', label: 'Equal split', desc: 'Everyone pays the same amount' },
  { value: 'exact', label: 'Exact amounts', desc: 'Specify what each person owes' },
  { value: 'percentage', label: 'Percentage', desc: 'Split by custom percentages' },
]

const baseSchema = z.object({
  title: z.string().min(2, 'At least 2 characters').max(200),
  amount: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Enter a valid amount'),
  currency: z.string().default('NGN'),
  category: z.string().default('other'),
  date: z.string().min(1, 'Date required'),
  paid_by_id: z.string().min(1, 'Select who paid'),
  description: z.string().max(500).optional(),
})

export default function AddExpensePage() {
  const { groupId } = useParams()
  const user = useAuthStore((s) => s.user)
  const [splitType, setSplitType] = useState('equal')
  const [splitData, setSplitData] = useState([])

  const { data: group } = useGroup(groupId)
  const { data: members = [], isLoading: membersLoading } = useGroupMembers(groupId)
  const createExpense = useCreateExpense(groupId)

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      currency: 'NGN',
      category: 'other',
      date: new Date().toISOString().split('T')[0],
      paid_by_id: user?.id || '',
    },
  })

  const totalAmount = parseFloat(watch('amount')) || 0

  // Initialize split data when members load
  useEffect(() => {
    if (members.length > 0) {
      setSplitData(members.map((m) => ({
        user_id: m.user.id,
        user: m.user,
        amount: (totalAmount / members.length).toFixed(2),
        percentage: (100 / members.length).toFixed(2),
      })))
    }
  }, [members])

  // Recalculate equal amounts when total changes
  useEffect(() => {
    if (splitType === 'equal' && members.length > 0) {
      setSplitData((prev) =>
        prev.map((s) => ({ ...s, amount: (totalAmount / members.length).toFixed(2) }))
      )
    }
  }, [totalAmount, splitType, members.length])

  const updateSplitField = (userId, field, value) => {
    setSplitData((prev) => prev.map((s) => s.user_id === userId ? { ...s, [field]: value } : s))
  }

  const exactTotal = splitData.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0)
  const pctTotal = splitData.reduce((s, d) => s + (parseFloat(d.percentage) || 0), 0)

  const onSubmit = (data) => {
    const payload = {
      ...data,
      split_type: splitType,
    }
    if (splitType !== 'equal') {
      payload.split_data = splitData.map((s) => ({
        user_id: s.user_id,
        ...(splitType === 'exact' ? { amount: s.amount } : { percentage: s.percentage }),
      }))
    }
    createExpense.mutate(payload)
  }

  if (membersLoading) return <PageLoader />

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <Link to={`/groups/${groupId}`} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to {group?.name}
        </Link>
        <h1 className="page-title">Add expense</h1>
        <p className="page-subtitle">Record a shared expense for {group?.name}.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider">Expense details</h2>

          <FormField label="Title" error={errors.title?.message} required>
            <Input placeholder="Dinner at Eko Hotel, Uber ride…" error={!!errors.title} {...register('title')} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount" error={errors.amount?.message} required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm font-mono">₦</span>
                <Input type="number" step="0.01" min="0.01" placeholder="0.00" className="pl-7 font-mono" error={!!errors.amount} {...register('amount')} />
              </div>
            </FormField>
            <FormField label="Date" error={errors.date?.message} required>
              <Input type="date" error={!!errors.date} {...register('date')} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" error={errors.category?.message}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Paid by" error={errors.paid_by_id?.message} required>
              <Controller
                name="paid_by_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger error={!!errors.paid_by_id}><SelectValue placeholder="Who paid?" /></SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.user.id} value={m.user.id}>{m.user.full_name || m.user.username}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <FormField label="Description (optional)">
            <textarea
              rows={2}
              placeholder="Any notes about this expense…"
              className="flex w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              {...register('description')}
            />
          </FormField>
        </div>

        {/* Split type */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider">How to split?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SPLIT_TYPES.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSplitType(value)}
                className={cn(
                  'text-left p-4 rounded-xl border-2 transition-all',
                  splitType === value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-ink-200 hover:border-ink-300 bg-white'
                )}
              >
                <p className={cn('text-sm font-semibold mb-0.5', splitType === value ? 'text-brand-700' : 'text-ink-800')}>{label}</p>
                <p className="text-xs text-ink-400">{desc}</p>
              </button>
            ))}
          </div>

          {/* Split rows */}
          {splitType !== 'equal' && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-ink-500 px-1">
                <span>Member</span>
                <span>{splitType === 'exact' ? 'Amount (₦)' : 'Percentage (%)'}</span>
              </div>
              {splitData.map((s) => (
                <div key={s.user_id} className="flex items-center gap-3">
                  <UserAvatar user={s.user} size="sm" />
                  <p className="flex-1 text-sm text-ink-800 truncate">{s.user?.full_name || s.user?.username}</p>
                  <div className="w-28">
                    <Input
                      type="number"
                      step={splitType === 'exact' ? '0.01' : '0.1'}
                      min="0"
                      className="text-right font-mono text-sm h-8"
                      value={splitType === 'exact' ? s.amount : s.percentage}
                      onChange={(e) => updateSplitField(s.user_id, splitType === 'exact' ? 'amount' : 'percentage', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              {/* Validation hints */}
              {splitType === 'exact' && totalAmount > 0 && (
                <div className={cn('text-xs px-1 pt-1', Math.abs(exactTotal - totalAmount) < 0.01 ? 'text-brand-600' : 'text-rose-500')}>
                  Total: ₦{exactTotal.toFixed(2)} / ₦{totalAmount.toFixed(2)}
                  {Math.abs(exactTotal - totalAmount) >= 0.01 && ' — must equal expense amount'}
                </div>
              )}
              {splitType === 'percentage' && (
                <div className={cn('text-xs px-1 pt-1', Math.abs(pctTotal - 100) < 0.01 ? 'text-brand-600' : 'text-rose-500')}>
                  Total: {pctTotal.toFixed(1)}% {Math.abs(pctTotal - 100) >= 0.01 && '— must equal 100%'}
                </div>
              )}
            </div>
          )}

          {splitType === 'equal' && members.length > 0 && totalAmount > 0 && (
            <div className="rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-600">
              Each of the {members.length} members pays{' '}
              <span className="font-mono font-semibold text-ink-900">
                ₦{(totalAmount / members.length).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Link to={`/groups/${groupId}`}>
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" size="lg" loading={createExpense.isPending}>
            <Receipt className="h-4 w-4" /> Add expense
          </Button>
        </div>
      </form>
    </div>
  )
}
