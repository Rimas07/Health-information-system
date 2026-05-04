import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/patients', icon: Users, label: 'Пациенты' },
  { to: '/audit', icon: FileText, label: 'Аудит' },
  { to: '/limits', icon: Settings, label: 'Лимиты' },
]

export default function AppLayout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('tenant_id')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">HIS System</h1>
          <p className="text-xs text-slate-500 mt-1">Медицинская информационная система</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut size={18} className="mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
