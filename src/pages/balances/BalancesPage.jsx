import { useState } from "react";
import { useGroups } from "@/hooks/useGroups";
import {
  useGroupDebts,
  useMyBalance,
  useSettleDebt,
} from "@/hooks/useBalances";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, SkeletonTable, Badge } from "@/components/ui/helpers";
import { UserAvatar } from "@/components/ui/avatar";
import { useInitiatePayment } from "@/hooks/usePayments";
import { useAuthStore } from "@/store/authStore";
import { Scale, CreditCard, CheckCircle2 } from "lucide-react";

export default function BalancesPage() {
  // 1. Initialized to "all" instead of empty string
  const [selectedGroup, setSelectedGroup] = useState("all");

  const { data: groupsData } = useGroups({ page_size: 100 });

  // 2. Map "all" to undefined so the hook fetches all group data
  const groupFilter = selectedGroup === "all" ? undefined : selectedGroup;

  const { data: debtsData, isLoading } = useGroupDebts(groupFilter);
  const { data: balance } = useMyBalance(groupFilter);

  // 3. For mutations, use the filter safely
  const { mutate: settle, isPending: settling } = useSettleDebt(groupFilter);
  const { mutate: pay, isPending: paying } = useInitiatePayment();
  const user = useAuthStore((s) => s.user);

  const groups = groupsData?.results || [];
  const debts = debtsData?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Balances</h1>
          <p className="page-subtitle">Track who owes who across your groups</p>
        </div>

        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filter by group" />
          </SelectTrigger>
          <SelectContent>
            {/* 4. Value changed from "" to "all" */}
            <SelectItem value="all">All groups</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id.toString()}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 5. Updated check to ensure balance is shown when a specific group or "all" is selected */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card stat-card-green p-5">
            <p className="text-xs text-ink-500 mb-1">Owed to you</p>
            <p className="text-2xl font-display font-bold text-brand-600">
              ₦{parseFloat(balance.total_owed_to_you || 0).toLocaleString()}
            </p>
          </div>
          <div className="card stat-card-red p-5">
            <p className="text-xs text-ink-500 mb-1">You owe</p>
            <p className="text-2xl font-display font-bold text-rose-600">
              ₦{parseFloat(balance.total_you_owe || 0).toLocaleString()}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-ink-500 mb-1">Net balance</p>
            <p
              className={`text-2xl font-display font-bold ${parseFloat(balance.net || 0) >= 0 ? "text-brand-600" : "text-rose-600"}`}
            >
              {parseFloat(balance.net || 0) >= 0 ? "+" : ""}₦
              {Math.abs(parseFloat(balance.net || 0)).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <SkeletonTable />
      ) : debts.length === 0 ? (
        <EmptyState
          icon={Scale}
          title={selectedGroup !== "all" ? "All settled up!" : "No balances"}
          description={
            selectedGroup !== "all"
              ? "No outstanding balances in this group."
              : "You have no outstanding debts across any group."
          }
        />
      ) : (
        <div className="space-y-3">
          {debts.map((debt) => {
            const isMyDebt = debt.debtor?.id === user?.id;
            return (
              <div
                key={debt.id}
                className="card px-5 py-4 flex items-center gap-4 flex-wrap"
              >
                <UserAvatar user={debt.debtor} />
                <div className="flex-1 min-w-[160px]">
                  <p className="text-sm text-ink-700">
                    <span className="font-semibold text-ink-900">
                      {debt.debtor?.full_name}
                    </span>
                    <span className="text-ink-400 mx-2">owes</span>
                    <span className="font-semibold text-ink-900">
                      {debt.creditor?.full_name}
                    </span>
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    {debt.group_name || ""}
                  </p>
                </div>
                <span className="font-mono font-bold text-lg text-rose-600">
                  ₦{parseFloat(debt.amount).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  {isMyDebt && (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={paying}
                      onClick={() => pay(debt.id)}
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Pay via Paystack
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={settling}
                    onClick={() => settle(debt.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark settled
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
