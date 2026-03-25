import { useState } from "react";
import { useReports, useGenerateReport } from "@/hooks/useReports";
import { useGroups } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader, EmptyState, SkeletonCard } from "@/components/ui/helpers";
import { BarChart3, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const CATEGORY_COLORS = {
  food: "#22c55e",
  transport: "#3b82f6",
  accommodation: "#f59e0b",
  entertainment: "#8b5cf6",
  utilities: "#06b6d4",
  shopping: "#ef4444",
  health: "#10b981",
  other: "#6b7280",
};

const PIE_COLORS = Object.values(CATEGORY_COLORS);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-ink-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-medium text-ink-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          ₦{parseFloat(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  // 1. Initialized to "all" instead of empty string
  const [selectedGroup, setSelectedGroup] = useState("all");

  const { data: groupsData } = useGroups({ page_size: 100 });

  // 2. Helper to determine if we are filtering by a specific group
  const groupFilter = selectedGroup === "all" ? undefined : selectedGroup;

  const { data: reportsData, isLoading } = useReports({
    month: month || undefined,
    year: year || undefined,
    group: groupFilter,
  });

  const { mutate: generate, isPending: generating } = useGenerateReport();

  const groups = groupsData?.results || [];
  const reports = reportsData?.results || [];
  const report = reports[0];

  const categoryData = report?.category_breakdown
    ? Object.entries(report.category_breakdown).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: parseFloat(value),
        color: CATEGORY_COLORS[name] || "#6b7280",
      }))
    : [];

  const comparisonData = reports.map((r) => ({
    name:
      groups.find((g) => g.id.toString() === r.group.toString())?.name ||
      "Group",
    spent: parseFloat(r.total_spent),
    paid: parseFloat(r.total_paid),
    owed: parseFloat(r.total_owed),
  }));

  const years = Array.from({ length: 5 }, (_, i) =>
    String(now.getFullYear() - i),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Monthly expense analytics</p>
        </div>
        <Button
          variant="primary"
          loading={generating}
          onClick={() =>
            generate({
              year: parseInt(year),
              month: parseInt(month),
              group_id: groupFilter, // 3. Passing the filtered ID correctly
            })
          }
        >
          <RefreshCw className="h-4 w-4" /> Generate report
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 4. Updated Group Select */}
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id.toString()}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <SkeletonCard key={i} />
            ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No reports yet"
          description="Generate a report to see your monthly spending breakdown."
          action={
            <Button
              variant="primary"
              loading={generating}
              onClick={() =>
                generate({
                  year: parseInt(year),
                  month: parseInt(month),
                  group_id: groupFilter,
                })
              }
            >
              <RefreshCw className="h-4 w-4" /> Generate now
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {report && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total spent",
                  value: report.total_spent,
                  color: "stat-card-blue",
                },
                {
                  label: "Total paid",
                  value: report.total_paid,
                  color: "stat-card-green",
                },
                {
                  label: "You owe",
                  value: report.total_owed,
                  color: "stat-card-red",
                },
                {
                  label: "Expenses",
                  value: report.expense_count,
                  color: "",
                  isCount: true,
                },
              ].map(({ label, value, color, isCount }) => (
                <div key={label} className={`card ${color} p-5`}>
                  <p className="text-xs text-ink-500 mb-1">{label}</p>
                  <p className="text-2xl font-display font-bold text-ink-900">
                    {isCount
                      ? value
                      : `₦${parseFloat(value || 0).toLocaleString()}`}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {categoryData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Spending by category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {categoryData.map((entry, idx) => (
                            <Cell
                              key={entry.name}
                              fill={
                                entry.color ||
                                PIE_COLORS[idx % PIE_COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v) =>
                            `₦${parseFloat(v).toLocaleString()}`
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {comparisonData.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Comparison across groups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" />
                        <Bar
                          dataKey="spent"
                          name="Spent"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="paid"
                          name="Paid"
                          fill="#22c55e"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="owed"
                          name="Owed"
                          fill="#ef4444"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {report && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Spending overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          {
                            month: `${MONTHS[parseInt(month) - 1]?.label} ${year}`,
                            spent: parseFloat(report.total_spent),
                            owed: parseFloat(report.total_owed),
                          },
                        ]}
                      >
                        <defs>
                          <linearGradient
                            id="spentGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#22c55e"
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor="#22c55e"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="spent"
                          name="Total spent"
                          stroke="#22c55e"
                          fill="url(#spentGrad)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="owed"
                          name="You owe"
                          stroke="#ef4444"
                          fill="none"
                          strokeWidth={2}
                          strokeDasharray="4 2"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
