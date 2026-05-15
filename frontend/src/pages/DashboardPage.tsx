import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/api/client'
import type { DashboardStats } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function StatCard({ title, value, icon, delay }: {
  title: string
  value: number | string
  icon: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{title}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            </div>
            <span className="text-3xl">{icon}</span>
          </div>
        </CardContent>
      </Card>
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
        <div className="text-slate-400 text-sm">{t('dashboard.loading')}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.title')}</h2>
          <p className="text-slate-500 text-sm mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <Badge variant={stats?.systemStatus === 'online' ? 'default' : 'destructive'}>
          {stats?.systemStatus === 'online' ? t('dashboard.system_online') : t('dashboard.system_error')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title={t('dashboard.companies')} value={stats?.totalTenants ?? 0} icon="🏢" delay={0} />
        <StatCard title={t('dashboard.patients')} value={stats?.totalPatients ?? 0} icon="👤" delay={0.1} />
        <StatCard title={t('dashboard.audit_events')} value={stats?.totalAuditEvents ?? 0} icon="📋" delay={0.2} />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.recent_events')}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentEvents && stats.recentEvents.length > 0 ? (
              <div className="space-y-3">
                {stats.recentEvents.map((event) => (
                  <div
                    key={event._id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">{event.eventType}</p>
                      <p className="text-xs text-slate-400">{event.tenantId}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(event.timestamp).toLocaleString(i18n.language)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">{t('dashboard.no_events')}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
