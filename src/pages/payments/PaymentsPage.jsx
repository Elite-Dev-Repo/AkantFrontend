import { useState } from "react"
import { usePayments, useInitiatePayment, useVerifyPayment } from "@/hooks/usePayments"
import { useGroupDebts } from "@/hooks/useBalances"
import { useGroups } from "@/hooks/useGroups"
import { useAuthStore } from "@/store/authStore"
import { Badge, SkeletonTable, EmptyState } from "@/components/ui/helpers"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, CheckCircle2, ExternalLink } from "lucide-react"
import { format } from "date-fns"

const STATUS_BADGE = { success:"green", pending:"amber", failed:"red", abandoned:"gray" }

export default function PaymentsPage() {
  const [page, setPage] = useState(1)
  const [refInput, setRefInput] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = usePayments({ page, page_size: 10 })
  const { data: groupsData } = useGroups({ page_size: 100 })
  const { data: debtsData } = useGroupDebts(selectedGroup || undefined)
  const { mutate: pay, isPending: paying } = useInitiatePayment()
  const { mutate: verify, isPending: verifying } = useVerifyPayment()

  const payments = data?.results || []
  const groups = groupsData?.results || []
  const debts = (debtsData?.results || []).filter((d) => d.debtor?.id === user?.id && !d.is_settled)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">Pay debts via Paystack and track your history</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pay a debt */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle>Pay a debt</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                <SelectContent>
                  {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {debts.length > 0 ? (
                <div className="space-y-2">
                  {debts.map((d) => (
                    <div key={d.id} className="rounded-lg border border-ink-100 p-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-ink-500">To {d.creditor?.full_name}</p>
                        <p className="font-mono font-semibold text-rose-600">₦{parseFloat(d.amount).toLocaleString()}</p>
                      </div>
                      <Button size="sm" variant="primary" loading={paying} onClick={() => pay(d.id)}>
                        <CreditCard className="h-3.5 w-3.5" /> Pay
                      </Button>
                    </div>
                  ))}
                </div>
              ) : selectedGroup ? (
                <p className="text-sm text-ink-400 text-center py-2">No outstanding debts 🎉</p>
              ) : (
                <p className="text-sm text-ink-400 text-center py-2">Select a group to see debts</p>
              )}
            </CardContent>
          </Card>

          {/* Verify payment */}
          <Card>
            <CardHeader><CardTitle>Verify payment</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-ink-500">After completing payment on Paystack, enter your reference here to confirm.</p>
              <Input placeholder="bills_xxxxxxxxxxxxx" value={refInput} onChange={(e) => setRefInput(e.target.value)} />
              <Button variant="secondary" className="w-full" loading={verifying} disabled={!refInput.trim()} onClick={() => { verify(refInput.trim()); setRefInput("") }}>
                <CheckCircle2 className="h-4 w-4" /> Verify payment
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Payment history */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display font-semibold text-ink-800">Payment history</h2>
          {isLoading ? <SkeletonTable /> : payments.length === 0 ? (
            <EmptyState icon={CreditCard} title="No payments yet" description="When you pay a debt via Paystack, it will appear here." />
          ) : (
            <>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 bg-ink-50">
                      {["Reference","Amount","To","Status","Date",""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-ink-50/50">
                        <td className="px-4 py-3 font-mono text-xs text-ink-600">{p.reference}</td>
                        <td className="px-4 py-3 font-mono font-semibold">₦{parseFloat(p.amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-ink-600">{p.recipient?.full_name}</td>
                        <td className="px-4 py-3"><Badge variant={STATUS_BADGE[p.status]||"gray"}>{p.status}</Badge></td>
                        <td className="px-4 py-3 text-ink-400">{p.created_at ? format(new Date(p.created_at),"MMM d, yyyy") : "—"}</td>
                        <td className="px-4 py-3">
                          {p.authorization_url && p.status === "pending" && (
                            <a href={p.authorization_url} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="ghost"><ExternalLink className="h-3.5 w-3.5" /></Button>
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={page} totalPages={data?.total_pages||1} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
