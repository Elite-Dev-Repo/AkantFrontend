import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Wallet,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  DollarSign,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/ui/avatar";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/groups", icon: Users, label: "Groups" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/balances", icon: Wallet, label: "Balances" },
  { to: "/payments", icon: CreditCard, label: "Payments" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/reminders", icon: Bell, label: "Reminders" },
];

export default function Sidebar({ open, onClose }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-ink-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full flex flex-col bg-white border-r border-ink-100",
          "transition-transform duration-300 ease-out",
          "w-[var(--sidebar-width)]",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-ink-100">
          <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm shadow-brand-200">
            <DollarSign className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-display font-bold text-ink-900 tracking-tight">
            Akant
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-2">
            Menu
          </p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => cn("nav-item", isActive && "active")}
            >
              <Icon className="nav-icon h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}

          <div className="pt-4">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-2">
              Account
            </p>
            <NavLink
              to="/settings/profile"
              onClick={onClose}
              className={({ isActive }) => cn("nav-item", isActive && "active")}
            >
              <Settings className="nav-icon h-4 w-4 shrink-0" />
              <span className="flex-1">Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-ink-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ink-50 transition-colors group">
            <UserAvatar user={user} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-900 truncate">
                {user?.full_name || user?.username || "User"}
              </p>
              <p className="text-xs text-ink-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => logout.mutate()}
              className="p-1.5 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
