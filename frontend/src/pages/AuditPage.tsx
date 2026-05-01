import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { apiClient } from '@/api/client'
import type { AuditEvent } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const eventColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  LOGIN: 'default',
  LOGOUT: 'secondary',
  CREATE: 'default',
  UPDATE: 'secondary',
  DELETE: 'destructive',
  ACCESS_DENIED: 'destructive',
}

export default function AuditPage() {
  const [search, setSearch] = useState('')

  const { data: events = [], isLoading } = useQuery<AuditEvent[]>({
    queryKey: ['audit'],
    queryFn: () => apiClient.get('/audit').then(r => r.data),
    refetchInterval: 15000,
  })

  const filtered = events.filter(e =>
    (e.eventType ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.tenantId ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.details ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Журнал аудита</h2>
        <p className="text-slate-500 text-sm mt-1">История всех действий в системе</p>
      </div>

      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <Input
          placeholder="Поиск по типу события, tenant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Загрузка...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">События не найдены</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Тип события</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Детали</TableHead>
                  <TableHead>Время</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((event, i) => (
                  <motion.tr
                    key={event._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <TableCell>
                      <Badge variant={eventColors[event.eventType] ?? 'secondary'}>
                        {event.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{event.tenantId}</TableCell>
                    <TableCell className="text-sm text-slate-500">{event.userId ?? '—'}</TableCell>
                    <TableCell className="text-sm text-slate-500 max-w-xs truncate">{event.details ?? '—'}</TableCell>
                    <TableCell className="text-sm text-slate-400 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString('ru')}
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
