import { Menu, Bell, Search, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { UserAvatar } from '@/components/ui/avatar'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function Topbar({ onMenuClick, title }) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[var(--sidebar-width)] z-10 h-[var(--topbar-height)] bg-white/90 backdrop-blur-md border-b border-ink-100 flex items-center px-4 lg:px-6 gap-4">
      {/* Hamburger (mobile) */}
      <button
        className="lg:hidden p-2 rounded-lg text-ink-600 hover:bg-ink-100 transition-colors"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <h1 className="text-base font-display font-semibold text-ink-900 flex-1 truncate hidden sm:block">
        {title}
      </h1>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications (placeholder) */}
        <button className="relative p-2 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>

        {/* User dropdown */}
        <div ref={dropRef} className="relative">
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-100 transition-colors"
          >
            <UserAvatar user={user} size="sm" />
            <span className="hidden sm:block text-sm font-medium text-ink-800 max-w-[120px] truncate">
              {user?.full_name || user?.username}
            </span>
            <ChevronDown className={cn('h-3.5 w-3.5 text-ink-400 transition-transform', dropOpen && 'rotate-180')} />
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-ink-100 shadow-lg py-1 z-50 animate-scale-in">
              <div className="px-3 py-2 border-b border-ink-100">
                <p className="text-sm font-semibold text-ink-900 truncate">{user?.full_name || user?.username}</p>
                <p className="text-xs text-ink-400 truncate">{user?.email}</p>
              </div>
              <button
                className="w-full text-left px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                onClick={() => { navigate('/settings/profile'); setDropOpen(false) }}
              >
                Profile Settings
              </button>
              <div className="border-t border-ink-100 mt-1 pt-1">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  onClick={() => logout.mutate()}
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
