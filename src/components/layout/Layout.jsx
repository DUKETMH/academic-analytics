import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/students':  'Students',
  '/at-risk':   'At-Risk Students',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  const title = Object.entries(PAGE_TITLES).find(
    ([path]) => location.pathname.startsWith(path)
  )?.[1] ?? 'Academic Analytics'

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-slate-200 p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-slate-200 flex-1">{title}</h2>

          <div className="flex items-center gap-3">
            <button className="relative text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-teal-400 rounded-full" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="w-7 h-7 bg-teal-500/20 rounded-full flex items-center justify-center">
                <span className="text-teal-400 text-xs font-bold">
                  {user?.full_name?.[0] ?? 'U'}
                </span>
              </div>
              <span className="text-sm text-slate-300">{user?.full_name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
