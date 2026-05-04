import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { apiClient } from '@/api/client'
import type { Patient } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface PatientForm {
  name: string
  surname: string
  age: string
}

const empty: PatientForm = { name: '', surname: '', age: '' }

export default function PatientsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [form, setForm] = useState<PatientForm>(empty)

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: () => apiClient.get('/patients').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: PatientForm) =>
      apiClient.post('/patients', { ...data, age: Number(data.age) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patients'] }); closeForm() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientForm }) =>
      apiClient.put(`/patients/${id}`, { ...data, age: Number(data.age) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patients'] }); closeForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/patients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })

  function openCreate() {
    setEditing(null)
    setForm(empty)
    setShowForm(true)
  }

  function openEdit(p: Patient) {
    setEditing(p)
    setForm({ name: p.name, surname: p.surname, age: String(p.age) })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    setForm(empty)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      updateMutation.mutate({ id: editing._id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const filtered = patients.filter(p =>
    (p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.surname ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Пациенты</h2>
          <p className="text-slate-500 text-sm mt-1">Управление записями пациентов</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          Добавить пациента
        </Button>
      </div>

      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <Input
          placeholder="Поиск по имени или фамилии..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {editing ? 'Редактировать пациента' : 'Новый пациент'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Имя *</Label>
                  <Input
                    placeholder="Иван"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Фамилия *</Label>
                  <Input
                    placeholder="Иванов"
                    value={form.surname}
                    onChange={e => setForm(f => ({ ...f, surname: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Возраст *</Label>
                  <Input
                    type="number"
                    placeholder="30"
                    min={0}
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-span-3 flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={closeForm}>Отмена</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editing ? 'Сохранить' : 'Создать'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Загрузка...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Пациенты не найдены</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Фамилия</TableHead>
                  <TableHead>Возраст</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.surname}</TableCell>
                    <TableCell>{p.age} лет</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(p)}>
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteMutation.mutate(p._id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
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
