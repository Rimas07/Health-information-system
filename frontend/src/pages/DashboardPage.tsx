import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Building2, UserRound, ClipboardList } from 'lucide-react'
import { apiClient } from '@/api/client'
import type { DashboardStats } from '@/types'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  accent: string
  bg: string
  delay: number
}

function StatCard({ title, value, icon, accent, bg, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 p-6 flex items-center justify-between group hover:shadow-md transition-shadow">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1 tabular-nums">{value}</p>
        </div>
        <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center ${accent} shadow-sm`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation()

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['stats'],
    queryFn: () => apiClient.get('/audit/stats').then(r => r.data),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {t('dashboard.loading')}
        </div>
      </div>
    )
  }

  const isOnline = stats?.systemStatus === 'online'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.title')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
          isOnline
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          {isOnline ? t('dashboard.system_online').replace('● ', '') : t('dashboard.system_error').replace('● ', '')}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard
          title={t('dashboard.companies')}
          value={stats?.totalTenants ?? 0}
          icon={<Building2 size={22} />}
          accent="text-blue-600"
          bg="bg-blue-50"
          delay={0}
        />
        <StatCard
          title={t('dashboard.patients')}
          value={stats?.totalPatients ?? 0}
          icon={<UserRound size={22} />}
          accent="text-emerald-600"
          bg="bg-emerald-50"
          delay={0.1}
        />
        <StatCard
          title={t('dashboard.audit_events')}
          value={stats?.totalAuditEvents ?? 0}
          icon={<ClipboardList size={22} />}
          accent="text-violet-600"
          bg="bg-violet-50"
          delay={0.2}
        />
      </div>

      {/* Recent events */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100"
      >
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">{t('dashboard.recent_events')}</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {stats?.recentEvents && stats.recentEvents.length > 0 ? (
            stats.recentEvents.map((event, i) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {event.eventType || <span className="text-slate-300">—</span>}
                    </p>
                    <p className="text-xs text-slate-400">{event.tenantId}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 tabular-nums">
                  {new Date(event.timestamp).toLocaleString(i18n.language)}
                </p>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-slate-400 text-center py-10">{t('dashboard.no_events')}</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
