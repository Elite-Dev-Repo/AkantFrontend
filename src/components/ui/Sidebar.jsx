import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Scale,
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
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Groups", icon: Users, to: "/groups" },
  { label: "Expenses", icon: Receipt, to: "/expenses" },
  { label: "Balances", icon: Scale, to: "/balances" },
  { label: "Payments", icon: CreditCard, to: "/payments" },
  { label: "Reports", icon: BarChart3, to: "/reports" },
  { label: "Reminders", icon: Bell, to: "/reminders" },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-white border-r border-ink-100 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "w-[var(--sidebar-width)]",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="h-[var(--topbar-height)] flex items-center px-5 border-b border-ink-100 shrink-0">
          <a href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm shadow-brand-300">
              <p className="text-white text-[1.2em]">₦</p>
            </div>
            <span className="text-xl font-display font-bold text-ink-900 tracking-tight">
              Akant
            </span>
          </a>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-widest px-3 pb-2 pt-1">
            Main
          </p>
          {NAV.map(({ label, icon: Icon, to }) => {
            const active =
              location.pathname === to ||
              location.pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={cn("nav-item", active && "active")}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 nav-icon shrink-0",
                    active ? "text-brand-600" : "text-ink-400",
                  )}
                />
                <span className="flex-1">{label}</span>
                {active && (
                  <ChevronRight className="h-3.5 w-3.5 text-brand-400" />
                )}
              </Link>
            );
          })}

          <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-widest px-3 pb-2 pt-4">
            Account
          </p>
          <Link
            to="/settings/profile"
            onClick={onClose}
            className={cn(
              "nav-item",
              location.pathname === "/settings/profile" && "active",
            )}
          >
            <Settings
              className={cn(
                "h-4 w-4 nav-icon shrink-0",
                location.pathname === "/settings/profile"
                  ? "text-brand-600"
                  : "text-ink-400",
              )}
            />
            <span className="flex-1">Settings</span>
          </Link>
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-ink-100 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-ink-50 transition-colors group">
            <UserAvatar user={user} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-800 truncate">
                {user?.full_name || user?.username || "User"}
              </p>
              <p className="text-xs text-ink-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-md text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
