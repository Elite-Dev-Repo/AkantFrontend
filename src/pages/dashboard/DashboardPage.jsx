import { useGroups } from "@/hooks/useGroups";
import { useAllExpenses } from "@/hooks/useExpenses";
import { useAuthStore } from "@/store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/helpers";
import {
  SkeletonCard,
  SkeletonTable,
  PageLoader,
} from "@/components/ui/helpers";
import { UserAvatar } from "@/components/ui/avatar";
import {
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

function StatCard({ title, value, sub, variant, icon: Icon }) {
  const variantClass =
    {
      green: "stat-card-green",
      red: "stat-card-red",
      blue: "stat-card-blue",
      amber: "stat-card-amber",
    }[variant] || "";
  const iconBg =
    {
      green: "bg-brand-100 text-brand-600",
      red: "bg-rose-100 text-rose-600",
      blue: "bg-blue-100 text-blue-600",
      amber: "bg-amber-100 text-amber-600",
    }[variant] || "bg-ink-100 text-ink-600";
  return (
    <div className={`card ${variantClass} p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-500 font-medium">{title}</p>
          <p className="text-3xl font-display font-bold text-ink-900 mt-1">
            {value}
          </p>
          {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { data: groupsData, isLoading: groupsLoading } = useGroups({
    page_size: 5,
  });
  const { data: expensesData, isLoading: expensesLoading } = useAllExpenses({
    page_size: 8,
    ordering: "-date",
  });

  const groups = groupsData?.results || [];
  const expenses = expensesData?.results || [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning ";
    if (h < 17) return "Good afternoon ";
    return "Good evening ";
  };

  const mood = () => {
    const h = new Date().getHours();
    if (h < 12) return "☀️";
    if (h < 17) return "🌞";
    return "🌙";
  };

  const CATEGORY_COLORS = {
    food: "green",
    transport: "blue",
    accommodation: "amber",
    entertainment: "blue",
    utilities: "amber",
    shopping: "red",
    health: "green",
    other: "gray",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">
            {greeting()}, {user?.first_name || "there"} {mood()}
          </h1>
          <p className="text-ink-500 mt-1">
            Here's what's happening with your expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/groups")}
          >
            <Users className="h-4 w-4" /> Groups
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/groups")}
          >
            <Plus className="h-4 w-4" /> Add expense
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {groupsLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Total groups"
              value={groupsData?.count ?? groups.length}
              sub="Active groups"
              variant="blue"
              icon={Users}
            />
            <StatCard
              title="Total expenses"
              value={expensesData?.count ?? expenses.length}
              sub="All time"
              variant="green"
              icon={Receipt}
            />
            <StatCard
              title="You are owed"
              value="—"
              sub="Across all groups"
              variant="green"
              icon={TrendingUp}
            />
            <StatCard
              title="You owe"
              value="—"
              sub="Across all groups"
              variant="red"
              icon={TrendingDown}
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-ink-800">
              Recent Expenses
            </h2>
            <Link to="/expenses">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          {expensesLoading ? (
            <SkeletonTable rows={5} />
          ) : (
            <div className="space-y-2">
              {expenses.length === 0 ? (
                <div className="card p-8 text-center text-ink-400 text-sm">
                  No expenses yet. Create a group to get started.
                </div>
              ) : (
                expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="card px-4 py-3 flex items-center gap-3 hover:border-ink-200 transition-colors cursor-pointer"
                    onClick={() => navigate(`/groups/${exp.group}`)}
                  >
                    <div className="h-9 w-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                      <Receipt className="h-4 w-4 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800 truncate">
                        {exp.title}
                      </p>
                      <p className="text-xs text-ink-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(exp.date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono font-semibold text-ink-800">
                        ₦{parseFloat(exp.amount).toLocaleString()}
                      </p>
                      <Badge variant={CATEGORY_COLORS[exp.category] || "gray"}>
                        {exp.category}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* My Groups */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-ink-800">
              My Groups
            </h2>
            <Link to="/groups">
              <Button variant="ghost" size="sm">
                All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          {groupsLoading ? (
            <SkeletonTable rows={4} />
          ) : (
            <div className="space-y-2">
              {groups.length === 0 ? (
                <div className="card p-6 text-center">
                  <p className="text-sm text-ink-400 mb-3">No groups yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate("/groups")}
                  >
                    <Plus className="h-3.5 w-3.5" /> Create group
                  </Button>
                </div>
              ) : (
                groups.map((g) => (
                  <Link key={g.id} to={`/groups/${g.id}`}>
                    <div className="card-hover px-4 py-3 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0 font-display font-bold text-brand-700">
                        {g.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-800 truncate">
                          {g.name}
                        </p>
                        <p className="text-xs text-ink-400">
                          {g.member_count} member
                          {g.member_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-ink-300 shrink-0" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
