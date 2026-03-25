import { Menu, Bell, Search, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Topbar({ onMenuClick }) {
  const user = useAuthStore((s) => s.user);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-20 h-[var(--topbar-height)] bg-white border-b border-ink-100",
        "flex items-center px-4 gap-3",
        "left-0 lg:left-[var(--sidebar-width)]",
        "transition-all duration-300",
      )}
    >
      {/* Mobile menu btn */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div
        className={cn(
          "flex-1 max-w-xs",
          searchOpen ? "flex" : "hidden sm:flex",
        )}
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            placeholder="Search expenses, groups…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-ink-200 bg-ink-50 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-end gap-2">
        {/* Mobile search toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setSearchOpen((v) => !v)}
        >
          {searchOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate("/reminders")}
        >
          <Bell className="h-5 w-5 text-ink-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-brand-500 rounded-full ring-2 ring-white" />
        </Button>

        {/* Avatar */}
        <button
          onClick={() => navigate("/settings/profile")}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-50 transition-colors"
        >
          <UserAvatar user={user} size="md" />
          <span className="hidden sm:block text-sm font-medium text-ink-800 max-w-[120px] truncate">
            {user?.first_name || user?.username}
          </span>
        </button>
      </div>
    </header>
  );
}
