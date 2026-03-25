import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '@/components/ui/Sidebar'
import Topbar from '@/components/ui/Topbar'
import { useAuthStore } from '@/store/authStore'
import { useMe } from '@/hooks/useAuth'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const updateUser = useAuthStore((s) => s.updateUser)

  const { data: me } = useMe()
  useEffect(() => {
    if (me) updateUser(me)
  }, [me])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <main className="pt-[var(--topbar-height)] lg:pl-[var(--sidebar-width)] min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-up">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
