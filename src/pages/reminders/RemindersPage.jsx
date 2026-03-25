import { useState } from 'react'
import { useReminders, useSendReminder } from '@/hooks/useReports'
import { useGroupDebts } from '@/hooks/useBalances'
import { useGroups } from '@/hooks/useGroups'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge, EmptyState, SkeletonTable } from '@/components/ui/helpers'
import { Pagination } from '@/components/ui/pagination'
import { UserAvatar } from '@/components/ui/avatar'
import { Bell, Send } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

export default function RemindersPage() {
  const [page, setPage] = useState(1)
  const [selectedGroup, setSelectedGroup] = useState('')
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useReminders({ page, page_size: 15 })
  const { data: groupsData } = useGroups({ page_size: 100 })
  const { data: debtsData } = useGroupDebts(selectedGroup || undefined)
  const { mutate: sendReminder, isPending } = useSendReminder()

  const reminders = data?.results || []
  const groups = groupsData?.results || []
  // Only debts where current user is creditor (can send reminder)
  const ownedDebts = (debtsData?.results || []).filter((d) => d.creditor?.id === user?.id && !d.is_settled)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Reminders</h1>
        <p className="page-subtitle">Send payment reminders to group members</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Send reminder panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-display font-semibold text-ink-800">Send a reminder</h3>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
              <SelectContent>
                {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {ownedDebts.length > 0 ? (
              <div className="space-y-2">
                {ownedDebts.map((d) => (
                  <div key={d.id} className="rounded-lg border border-ink-100 p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <UserAvatar user={d.debtor} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink-800 truncate">{d.debtor?.full_name}</p>
                        <p className="text-xs font-mono text-rose-600">₦{parseFloat(d.amount).toLocaleString()}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="primary" loading={isPending} onClick={() => sendReminder(d.id)}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : selectedGroup ? (
              <p className="text-sm text-ink-400 text-center py-3">No outstanding debts owed to you 🎉</p>
            ) : (
              <p className="text-sm text-ink-400 text-center py-3">Select a group to see outstanding debts</p>
            )}
          </div>

          <div className="card p-5 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Reminder policy</p>
                <p className="text-xs text-amber-700 mt-1">To avoid spam, reminders can only be sent once every 3 days per debt.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reminder history */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display font-semibold text-ink-800">Reminder history</h2>
          {isLoading ? <SkeletonTable /> : reminders.length === 0 ? (
            <EmptyState icon={Bell} title="No reminders yet" description="When you send or receive reminders, they'll appear here." />
          ) : (
            <>
              <div className="space-y-2">
                {reminders.map((r) => (
                  <div key={r.id} className="card px-4 py-3 flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${r.is_successful ? 'bg-brand-100' : 'bg-rose-100'}`}>
                      <Bell className={`h-4 w-4 ${r.is_successful ? 'text-brand-600' : 'text-rose-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-700">
                        Reminder sent to <span className="font-medium">{r.sent_to?.full_name}</span>
                      </p>
                      <p className="text-xs text-ink-400">
                        {formatDistanceToNow(new Date(r.sent_at), { addSuffix: true })} via {r.channel}
                      </p>
                    </div>
                    <Badge variant={r.is_successful ? 'green' : 'red'}>
                      {r.is_successful ? 'Sent' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
              <Pagination currentPage={page} totalPages={data?.total_pages || 1} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
