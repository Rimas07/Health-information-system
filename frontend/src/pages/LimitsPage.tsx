import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { apiClient } from '@/api/client'
import type { RateLimit } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function LimitsPage() {
  const { data: limits = [], isLoading } = useQuery<RateLimit[]>({
    queryKey: ['limits'],
    queryFn: () => apiClient.get('/limits').then(r => r.data),
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Лимиты запросов</h2>
        <p className="text-slate-500 text-sm mt-1">Настройки rate limiting по tenant</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Всего правил</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{limits.length}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Уникальных endpoint</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">
                {new Set(limits.map(l => l.endpoint)).size}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Уникальных tenant</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">
                {new Set(limits.map(l => l.tenantId)).size}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Правила лимитирования</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Загрузка...</div>
          ) : limits.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Правила не настроены</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Макс. запросов</TableHead>
                  <TableHead>Окно (мс)</TableHead>
                  <TableHead>Создан</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {limits.map((limit, i) => (
                  <motion.tr
                    key={limit._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="font-medium">{limit.tenantId}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{limit.endpoint}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">{limit.maxRequests}</TableCell>
                    <TableCell className="text-slate-500">{(limit.windowMs / 1000).toFixed(0)}с</TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {new Date(limit.createdAt).toLocaleDateString('ru')}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
