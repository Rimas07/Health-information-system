import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { apiClient } from '@/api/client'
import type { DataLimit, DataUsage } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const danger = pct >= 90
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{value.toLocaleString()}</span>
        <span>{pct.toFixed(1)}% из {max.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${danger ? 'bg-red-500' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function LimitsPage() {
  const qc = useQueryClient()
  const tenantId = localStorage.getItem('tenant_id') ?? ''
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ maxDocuments: 1000, maxDataSizeKB: 51200, monthlyQueries: 1000 })

  const { data: limits, isLoading: limitsLoading } = useQuery<DataLimit>({
    queryKey: ['limits', tenantId],
    queryFn: () => apiClient.get(`/limits/${tenantId}`).then(r => r.data),
    enabled: !!tenantId,
  })

  const { data: usage, isLoading: usageLoading } = useQuery<DataUsage>({
    queryKey: ['limits-usage', tenantId],
    queryFn: () => apiClient.get(`/limits/usage/${tenantId}`).then(r => r.data),
    enabled: !!tenantId,
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (limits) {
      setForm({
        maxDocuments: limits.maxDocuments,
        maxDataSizeKB: limits.maxDataSizeKB,
        monthlyQueries: limits.monthlyQueries,
      })
    }
  }, [limits])

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => apiClient.put(`/limits/${tenantId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['limits', tenantId] })
      setEditing(false)
    },
  })

  const isLoading = limitsLoading || usageLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400 text-sm">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Лимиты</h2>
          <p className="text-slate-500 text-sm mt-1">Использование ресурсов вашей организации</p>
        </div>
        <Button variant={editing ? 'outline' : 'default'} onClick={() => setEditing(e => !e)}>
          {editing ? 'Отмена' : 'Изменить лимиты'}
        </Button>
      </div>

      {/* Usage cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: 'Документы',
            icon: '📄',
            value: usage?.documentsCount ?? 0,
            max: limits?.maxDocuments ?? 1000,
            color: 'bg-blue-500',
            delay: 0,
          },
          {
            label: 'Размер данных',
            icon: '💾',
            value: usage?.dataSizeKB ?? 0,
            max: limits?.maxDataSizeKB ?? 51200,
            color: 'bg-violet-500',
            delay: 0.1,
            unit: 'KB',
          },
          {
            label: 'Запросов в месяц',
            icon: '⚡',
            value: usage?.queriesCount ?? 0,
            max: limits?.monthlyQueries ?? 1000,
            color: 'bg-emerald-500',
            delay: 0.2,
          },
        ].map(({ label, icon, value, max, color, delay, unit }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-slate-500">{label}</p>
                  <span className="text-xl">{icon}</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {value.toLocaleString()}{unit ? ` ${unit}` : ''}
                </p>
                <ProgressBar value={value} max={max} color={color} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Edit form */}
      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Изменить лимиты</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={e => { e.preventDefault(); updateMutation.mutate(form) }}
                className="grid grid-cols-3 gap-6"
              >
                <div className="space-y-2">
                  <Label>Макс. документов</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.maxDocuments}
                    onChange={e => setForm(f => ({ ...f, maxDocuments: +e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Макс. размер (KB)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.maxDataSizeKB}
                    onChange={e => setForm(f => ({ ...f, maxDataSizeKB: +e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Запросов в месяц</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.monthlyQueries}
                    onChange={e => setForm(f => ({ ...f, monthlyQueries: +e.target.value }))}
                  />
                </div>
                <div className="col-span-3 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Current limits summary */}
      {!editing && limits && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Текущие лимиты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-500">Документы</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{limits.maxDocuments.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-500">Размер данных</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{limits.maxDataSizeKB.toLocaleString()} KB</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-500">Запросов в месяц</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{limits.monthlyQueries.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
