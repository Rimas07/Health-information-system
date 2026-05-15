import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

export default function AppLayout() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), color: 'text-blue-400' },
    { to: '/patients', icon: Users, label: t('nav.patients'), color: 'text-emerald-400' },
    { to: '/audit', icon: FileText, label: t('nav.audit'), color: 'text-violet-400' },
    { to: '/limits', icon: Settings, label: t('nav.limits'), color: 'text-amber-400' },
  ]

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('tenant_id')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-lg shadow-lg shadow-blue-500/30 flex-shrink-0">
              🏥
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">{t('app.title')}</h1>
              <p className="text-slate-400 text-xs mt-0.5 leading-tight">{t('app.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, color }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={`flex-shrink-0 transition-colors ${isActive ? color : 'text-slate-500 group-hover:text-slate-300'}`}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-slate-700/60 pt-3 space-y-2">
          <div className="px-3">
            <LanguageSwitcher dark />
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={17} className="flex-shrink-0" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
