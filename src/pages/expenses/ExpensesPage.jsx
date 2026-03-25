import { useState } from "react";
import { useAllExpenses } from "@/hooks/useExpenses";
import { useGroups } from "@/hooks/useGroups";
import { Badge, SkeletonTable, EmptyState } from "@/components/ui/helpers";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Receipt, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

// Removed the empty string from the array to keep the map clean
const CATS = [
  "food",
  "transport",
  "accommodation",
  "entertainment",
  "utilities",
  "shopping",
  "health",
  "other",
];
const CAT_BADGE = {
  food: "green",
  transport: "blue",
  accommodation: "amber",
  entertainment: "blue",
  utilities: "amber",
  shopping: "red",
  health: "green",
  other: "gray",
};

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  // Changed initial state to "all" to match the new SelectItem values
  const [category, setCategory] = useState("all");
  const [settled, setSettled] = useState("all");
  const navigate = useNavigate();

  const { data, isLoading } = useAllExpenses({
    page,
    page_size: 15,
    search: search || undefined,
    // Check for "all" instead of empty string
    category: category === "all" ? undefined : category,
    is_settled: settled === "all" ? undefined : settled === "true",
    ordering: "-date",
  });

  const expenses = data?.results || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Expenses</h1>
        <p className="page-subtitle">All expenses across your groups</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <Input
            className="pl-9"
            placeholder="Search expenses…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Updated Category Select */}
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATS.map((c) => (
              <SelectItem key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Updated Status Select */}
        <Select
          value={settled}
          onValueChange={(v) => {
            setSettled(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="false">Pending</SelectItem>
            <SelectItem value="true">Settled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses found"
          description="Try adjusting your filters."
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50">
                    {[
                      "Title",
                      "Date",
                      "Amount",
                      "Category",
                      "Split",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {expenses.map((exp) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-ink-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-md bg-brand-100 flex items-center justify-center shrink-0">
                            <Receipt className="h-3.5 w-3.5 text-brand-600" />
                          </div>
                          <span className="font-medium text-ink-800 truncate max-w-[160px]">
                            {exp.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {exp.date
                          ? format(new Date(exp.date), "MMM d, yyyy")
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-ink-800">
                        ₦{parseFloat(exp.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={CAT_BADGE[exp.category] || "gray"}>
                          {exp.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-ink-500 capitalize">
                        {exp.split_type}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={exp.is_settled ? "green" : "amber"}>
                          {exp.is_settled ? "Settled" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/groups/${exp.group}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={page}
            totalPages={data?.total_pages || 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
