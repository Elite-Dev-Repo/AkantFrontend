import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGroups } from "@/hooks/useGroups";
import { useGroupDebts } from "@/hooks/useBalances";
import { useAuthStore } from "@/store/authStore";
import { paymentsApi } from "@/api/payments.api";
import { authApi } from "@/api/auth.api";
import { getApiError } from "@/api/axios";
import { useToast } from "@/components/ui/use-toast";
import {
  Badge,
  EmptyState,
  SkeletonTable,
  PageLoader,
} from "@/components/ui/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/avatar";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Copy,
  Building2,
  Plus,
  AlertCircle,
  ArrowRight,
  Banknote,
} from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────

function useBankTransfers() {
  return useQuery({
    queryKey: ["bank-transfers"],
    queryFn: async () => {
      const { data } = await paymentsApi.listBankTransfers();
      return data;
    },
  });
}

function useInitiateBankTransfer() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ debtId, note }) => {
      const { data } = await paymentsApi.initiateBankTransfer(debtId, note);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bank-transfers"] });
    },
    onError: (err) => {
      toast({
        title: "Failed",
        description: getApiError(err),
        variant: "destructive",
      });
    },
  });
}

function useConfirmBankTransfer() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (transferId) => {
      const { data } = await paymentsApi.confirmBankTransfer(transferId);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bank-transfers"] });
      qc.invalidateQueries({ queryKey: ["debts"] });
      toast({
        title: "Payment confirmed!",
        description: "The debt has been settled.",
      });
    },
    onError: (err) => {
      toast({
        title: "Failed",
        description: getApiError(err),
        variant: "destructive",
      });
    },
  });
}

function useAccountDetails() {
  return useQuery({
    queryKey: ["account-details"],
    queryFn: async () => {
      const { data } = await authApi.getAccountDetails();
      return data.results || data;
    },
  });
}

function useSaveAccountDetails() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      if (id) {
        const { data } = await authApi.updateAccountDetails(id, payload);
        return data;
      }
      const { data } = await authApi.createAccountDetails(payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["account-details"] });
      toast({ title: "Account details saved!" });
    },
    onError: (err) => {
      toast({
        title: "Failed",
        description: getApiError(err),
        variant: "destructive",
      });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Account Details Banner (shown when user has no account info)
// ─────────────────────────────────────────────────────────────

const accountSchema = z.object({
  account_name: z.string().min(2, "Required"),
  account_number: z
    .string()
    .min(10, "Must be at least 10 digits")
    .max(10, "Must be 10 digits"),
  bank_name: z.string().min(2, "Required"),
});

function AccountDetailsModal({ open, onClose, existing }) {
  const { mutate: save, isPending } = useSaveAccountDetails();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: existing || {},
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existing ? "Update bank account" : "Add bank account"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((d) =>
            save({ ...d, id: existing?.id }, { onSuccess: onClose }),
          )}
        >
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Your bank details are shown to group members who owe you money
                so they can pay you directly.
              </p>
            </div>
            <FormField
              label="Account name"
              error={errors.account_name?.message}
              required
            >
              <Input
                placeholder="e.g. Chidi Nwosu"
                {...register("account_name")}
                error={!!errors.account_name}
              />
            </FormField>
            <FormField
              label="Account number"
              error={errors.account_number?.message}
              required
            >
              <Input
                placeholder="0123456789"
                maxLength={10}
                {...register("account_number")}
                error={!!errors.account_number}
              />
            </FormField>
            <FormField
              label="Bank name"
              error={errors.bank_name?.message}
              required
            >
              <Input
                placeholder="e.g. GTBank, Access, Zenith"
                {...register("bank_name")}
                error={!!errors.bank_name}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              Save details
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Transfer Detail Card (shown to debtor after initiating)
// ─────────────────────────────────────────────────────────────

function TransferCard({ transfer, currentUserId, onConfirm, confirming }) {
  const [copied, setCopied] = useState(null);
  const isDebtor = transfer.payer?.id === currentUserId;
  const isCreditor = transfer.creditor?.id === currentUserId;
  const isPending = transfer.status === "pending";
  const isConfirmed = transfer.status === "confirmed";

  const copy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, field }) => (
    <button
      onClick={() => copy(text, field)}
      className="ml-2 p-1 rounded text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
    >
      {copied === field ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-brand-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );

  return (
    <div
      className={`card overflow-hidden ${isConfirmed ? "border-brand-200" : "border-amber-200"}`}
    >
      {/* Header stripe */}
      <div
        className={`px-5 py-3 flex items-center justify-between ${isConfirmed ? "bg-brand-50" : "bg-amber-50"}`}
      >
        <div className="flex items-center gap-2">
          {isConfirmed ? (
            <CheckCircle2 className="h-4 w-4 text-brand-600" />
          ) : (
            <Clock className="h-4 w-4 text-amber-600" />
          )}
          <span
            className={`text-sm font-semibold ${isConfirmed ? "text-brand-700" : "text-amber-700"}`}
          >
            {isConfirmed ? "Payment confirmed" : "Awaiting confirmation"}
          </span>
        </div>
        <Badge variant={isConfirmed ? "green" : "amber"}>
          {transfer.status}
        </Badge>
      </div>

      <div className="p-5 space-y-5">
        {/* Parties */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <UserAvatar user={transfer.payer} size="sm" />
            <div className="min-w-0">
              <p className="text-xs text-ink-400">Debtor</p>
              <p className="text-sm font-medium text-ink-800 truncate">
                {transfer.payer?.full_name}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-ink-300 shrink-0" />
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <div className="min-w-0 text-right">
              <p className="text-xs text-ink-400">Creditor</p>
              <p className="text-sm font-medium text-ink-800 truncate">
                {transfer.creditor?.full_name}
              </p>
            </div>
            <UserAvatar user={transfer.creditor} size="sm" />
          </div>
        </div>

        {/* Amount */}
        <div className="text-center py-3 bg-ink-50 rounded-xl">
          <p className="text-xs text-ink-400 mb-1">Amount to pay</p>
          <p className="text-3xl font-display font-bold text-ink-900">
            ₦{parseFloat(transfer.amount).toLocaleString()}
          </p>
        </div>

        {/* Bank details — shown to debtor or always visible */}
        {transfer.account_details && (
          <div className="rounded-xl border border-ink-100 overflow-hidden">
            <div className="flex items-center gap-2 bg-ink-50 px-4 py-2.5 border-b border-ink-100">
              <Building2 className="h-4 w-4 text-ink-500" />
              <span className="text-sm font-semibold text-ink-700">
                Bank transfer details
              </span>
              {isDebtor && isPending && (
                <span className="ml-auto text-xs text-ink-400">
                  Make the transfer and wait for confirmation
                </span>
              )}
            </div>
            <div className="divide-y divide-ink-50">
              {[
                {
                  label: "Bank",
                  value: transfer.account_details.bank_name,
                  field: "bank",
                },
                {
                  label: "Account number",
                  value: transfer.account_details.account_number,
                  field: "account_number",
                },
                {
                  label: "Account name",
                  value: transfer.account_details.account_name,
                  field: "account_name",
                },
              ].map(({ label, value, field }) => (
                <div
                  key={field}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-xs text-ink-400 w-32 shrink-0">
                    {label}
                  </span>
                  <span className="text-sm font-medium text-ink-800 font-mono flex-1">
                    {value}
                  </span>
                  <CopyBtn text={value} field={field} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        {transfer.note && (
          <div className="bg-ink-50 rounded-lg px-4 py-3">
            <p className="text-xs text-ink-400 mb-1">Note</p>
            <p className="text-sm text-ink-700">{transfer.note}</p>
          </div>
        )}

        {/* Creditor confirm button */}
        {isCreditor && isPending && (
          <div className="pt-2 border-t border-ink-100">
            <p className="text-xs text-ink-500 mb-3">
              Once you have received ₦
              {parseFloat(transfer.amount).toLocaleString()} in your account,
              click below to confirm and settle the debt.
            </p>
            <Button
              variant="primary"
              className="w-full"
              loading={confirming}
              onClick={() => onConfirm(transfer.id)}
            >
              <CheckCircle2 className="h-4 w-4" />I have received this payment
            </Button>
          </div>
        )}

        {/* Confirmed info */}
        {isConfirmed && transfer.confirmed_at && (
          <p className="text-xs text-brand-600 text-center">
            Confirmed on{" "}
            {format(new Date(transfer.confirmed_at), "MMM d, yyyy 'at' h:mm a")}
          </p>
        )}

        {/* Date */}
        <p className="text-xs text-ink-400 text-center">
          Created{" "}
          {format(new Date(transfer.created_at), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Initiate Transfer Modal
// ─────────────────────────────────────────────────────────────

function InitiateTransferModal({ open, onClose, debt, onSuccess }) {
  const [note, setNote] = useState("");
  const { mutate: initiate, isPending } = useInitiateBankTransfer();

  const handleSubmit = () => {
    initiate(
      { debtId: debt.id, note },
      {
        onSuccess: (data) => {
          onSuccess(data.data);
          onClose();
        },
      },
    );
  };

  if (!debt) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Pay ₦{parseFloat(debt.amount).toLocaleString()} to{" "}
            {debt.creditor?.full_name}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
            <Banknote className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              This will create a payment instance showing you{" "}
              {debt.creditor?.full_name}'s bank account details. Make the
              transfer via your own bank app, then they confirm receipt.
            </p>
          </div>
          <FormField label="Add a note (optional)">
            <Input
              placeholder="e.g. Payment for March rent"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isPending} onClick={handleSubmit}>
            <Banknote className="h-4 w-4" /> Get account details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [initiateModalOpen, setInitiateModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [activeTab, setActiveTab] = useState("transfers");

  const user = useAuthStore((s) => s.user);
  const { data: groupsData } = useGroups({ page_size: 100 });
  const { data: debtsData, isLoading: debtsLoading } = useGroupDebts(
    selectedGroup || undefined,
  );
  const { data: transfers, isLoading: transfersLoading } = useBankTransfers();
  const { data: accountDetails, isLoading: accountLoading } =
    useAccountDetails();
  const { mutate: confirm, isPending: confirming } = useConfirmBankTransfer();

  const groups = groupsData?.results || [];
  const myDebts = (debtsData?.results || []).filter(
    (d) => d.debtor?.id === user?.id && !d.is_settled,
  );
  const allTransfers = transfers?.results || transfers || [];
  const myAccount = Array.isArray(accountDetails) ? accountDetails[0] : null;

  const TABS = [
    { id: "transfers", label: "Transfer history" },
    { id: "pay", label: "Pay a debt" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">
            Pay debts via bank transfer and track confirmations
          </p>
        </div>
        <Button variant="secondary" onClick={() => setAccountModalOpen(true)}>
          <Building2 className="h-4 w-4" />
          {myAccount ? "Update bank account" : "Add bank account"}
        </Button>
      </div>

      {/* No account banner */}
      {!accountLoading && !myAccount && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Add your bank account
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Group members who owe you money need your account details to pay
              you. Add them now.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setAccountModalOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add now
          </Button>
        </div>
      )}

      {/* Current account info */}
      {myAccount && (
        <div className="card px-5 py-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-800">
              {myAccount.bank_name}
            </p>
            <p className="text-xs text-ink-500 font-mono">
              {myAccount.account_number} &middot; {myAccount.account_name}
            </p>
          </div>
          <Badge variant="green">Active</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAccountModalOpen(true)}
          >
            Edit
          </Button>
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
                ? "border-brand-500 text-brand-700"
                : "border-transparent text-ink-500 hover:text-ink-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PAY A DEBT TAB ── */}
      {activeTab === "pay" && (
        <div className="space-y-4">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!selectedGroup && (
            <EmptyState
              icon={CreditCard}
              title="Select a group"
              description="Choose a group to see debts you need to pay."
            />
          )}

          {selectedGroup && debtsLoading && <SkeletonTable rows={3} />}

          {selectedGroup && !debtsLoading && myDebts.length === 0 && (
            <EmptyState
              icon={CheckCircle2}
              title="All settled up!"
              description="You have no outstanding debts in this group."
            />
          )}

          {myDebts.map((debt) => (
            <div
              key={debt.id}
              className="card px-5 py-4 flex items-center gap-4 flex-wrap"
            >
              <UserAvatar user={debt.creditor} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900">
                  You owe{" "}
                  <span className="text-rose-600">
                    {debt.creditor?.full_name}
                  </span>
                </p>
                <p className="text-xs text-ink-400 mt-0.5">
                  {debt.creditor?.email}
                </p>
              </div>
              <span className="font-display font-bold text-xl text-rose-600">
                ₦{parseFloat(debt.amount).toLocaleString()}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedDebt(debt);
                  setInitiateModalOpen(true);
                }}
              >
                <Banknote className="h-4 w-4" /> Pay via bank transfer
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ── TRANSFER HISTORY TAB ── */}
      {activeTab === "transfers" && (
        <div className="space-y-4">
          {transfersLoading && <SkeletonTable rows={4} />}
          {!transfersLoading && allTransfers.length === 0 && (
            <EmptyState
              icon={Banknote}
              title="No transfers yet"
              description="When you pay or receive a bank transfer, it will appear here."
            />
          )}
          {allTransfers.map((transfer) => (
            <TransferCard
              key={transfer.id}
              transfer={transfer}
              currentUserId={user?.id}
              onConfirm={confirm}
              confirming={confirming}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AccountDetailsModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        existing={myAccount}
      />

      <InitiateTransferModal
        open={initiateModalOpen}
        onClose={() => setInitiateModalOpen(false)}
        debt={selectedDebt}
        onSuccess={() => setActiveTab("transfers")}
      />
    </div>
  );
}
