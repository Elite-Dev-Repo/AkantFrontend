import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGroup, useGroupMembers, useSendInvite, useRemoveMember } from '@/hooks/useGroups'
import { useGroupExpenses } from '@/hooks/useExpenses'
import { useMyBalance, useGroupDebts } from '@/hooks/useBalances'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/forms/FormField'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PageLoader, SkeletonTable, EmptyState, Badge } from '@/components/ui/helpers'
import { UserAvatar } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, UserPlus, ArrowLeft, Receipt, Scale, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'

const inviteSchema = z.object({ email: z.string().email('Valid email required') })

export default function GroupDetailPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('expenses')

  const { data: group, isLoading: groupLoading } = useGroup(groupId)
  const { data: members, isLoading: membersLoading } = useGroupMembers(groupId)
  const { data: expensesData, isLoading: expensesLoading } = useGroupExpenses(groupId, { page_size: 20 })
  const { data: balance } = useMyBalance(groupId)
  const { data: debtsData } = useGroupDebts(groupId)
  const { mutate: sendInvite, isPending: invitePending } = useSendInvite(groupId)
  const { mutate: removeMember } = useRemoveMember(groupId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(inviteSchema) })

  if (groupLoading) return <PageLoader />

  const expenses = expensesData?.results || []
  const debts = debtsData?.results || []
  const TABS = [
    { id: 'expenses', label: 'Expenses', count: expensesData?.count },
    { id: 'balances', label: 'Balances', count: debts.length },
    { id: 'members', label: 'Members', count: members?.length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="page-title truncate">{group?.name}</h1>
          {group?.description && <p className="page-subtitle">{group.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" /> Invite
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate(`/groups/${groupId}/expenses/add`)}>
            <Plus className="h-4 w-4" /> Add expense
          </Button>
        </div>
      </div>

      {/* Balance summary */}
      {balance && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card stat-card-green p-4 text-center">
            <p className="text-xs text-ink-500 mb-1">Owed to you</p>
            <p className="text-xl font-display font-bold text-brand-600">₦{parseFloat(balance.total_owed_to_you || 0).toLocaleString()}</p>
          </div>
          <div className="card stat-card-red p-4 text-center">
            <p className="text-xs text-ink-500 mb-1">You owe</p>
            <p className="text-xl font-display font-bold text-rose-600">₦{parseFloat(balance.total_you_owe || 0).toLocaleString()}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-ink-500 mb-1">Net</p>
            <p className={`text-xl font-display font-bold ${parseFloat(balance.net || 0) >= 0 ? 'text-brand-600' : 'text-rose-600'}`}>
              ₦{Math.abs(parseFloat(balance.net || 0)).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-brand-500 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-1.5 text-xs bg-ink-100 text-ink-500 rounded-full px-1.5 py-0.5">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'expenses' && (
        expensesLoading ? <SkeletonTable /> : expenses.length === 0 ? (
          <EmptyState icon={Receipt} title="No expenses yet"
            description="Add the first expense to this group."
            action={<Button variant="primary" onClick={() => navigate(`/groups/${groupId}/expenses/add`)}><Plus className="h-4 w-4" />Add expense</Button>} />
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div key={exp.id} className="card px-4 py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <Receipt className="h-4 w-4 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{exp.title}</p>
                  <p className="text-xs text-ink-400">
                    Paid by {exp.paid_by?.full_name} · {format(new Date(exp.date), 'MMM d')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono font-semibold text-ink-800">₦{parseFloat(exp.amount).toLocaleString()}</p>
                  <Badge variant={exp.is_settled ? 'green' : 'amber'}>{exp.is_settled ? 'Settled' : 'Pending'}</Badge>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'balances' && (
        <div className="space-y-2">
          {debts.length === 0 ? (
            <EmptyState icon={Scale} title="All settled up!" description="No outstanding balances in this group." />
          ) : debts.map((debt) => (
            <div key={debt.id} className="card px-4 py-3 flex items-center gap-3">
              <UserAvatar user={debt.debtor} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-700">
                  <span className="font-medium">{debt.debtor?.full_name}</span>
                  <span className="text-ink-400 mx-2">owes</span>
                  <span className="font-medium">{debt.creditor?.full_name}</span>
                </p>
              </div>
              <p className="font-mono font-semibold text-rose-600">₦{parseFloat(debt.amount).toLocaleString()}</p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/payments')}>Pay</Button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        membersLoading ? <SkeletonTable /> : (
          <div className="space-y-2">
            {(members || []).map((m) => (
              <div key={m.id} className="card px-4 py-3 flex items-center gap-3">
                <UserAvatar user={m.user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800">{m.user?.full_name}</p>
                  <p className="text-xs text-ink-400">{m.user?.email}</p>
                </div>
                <Badge variant={m.role === 'admin' ? 'amber' : 'gray'}>{m.role}</Badge>
              </div>
            ))}
          </div>
        )
      )}

      {/* Invite Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite to {group?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => sendInvite(d.email, { onSuccess: () => { setInviteOpen(false); reset() } }))}>
            <div className="px-6 py-4">
              <FormField label="Email address" error={errors.email?.message} required>
                <Input type="email" placeholder="friend@example.com" {...register('email')} error={!!errors.email} />
              </FormField>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={invitePending}>Send invite</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
