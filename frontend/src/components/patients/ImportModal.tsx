import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X, Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/api/client'

interface PatientRow {
  name: string
  surname: string
  age: number
}

interface ImportModalProps {
  onClose: () => void
  onSuccess: () => void
}

// Common column name aliases
const NAME_ALIASES = ['name', 'first_name', 'firstname', 'имя', 'nombre', 'vorname', 'jméno']
const SURNAME_ALIASES = ['surname', 'last_name', 'lastname', 'фамилия', 'apellido', 'nachname', 'příjmení']
const AGE_ALIASES = ['age', 'возраст', 'edad', 'alter', 'věk', 'years']

function detectColumn(headers: string[], aliases: string[]): string {
  const lower = headers.map(h => h.toLowerCase().trim())
  for (const alias of aliases) {
    const idx = lower.indexOf(alias.toLowerCase())
    if (idx !== -1) return headers[idx]
  }
  return ''
}

function parseRows(raw: Record<string, unknown>[], mapping: { name: string; surname: string; age: string }): PatientRow[] {
  return raw
    .map(row => ({
      name: String(row[mapping.name] ?? '').trim(),
      surname: String(row[mapping.surname] ?? '').trim(),
      age: Number(row[mapping.age] ?? 0),
    }))
    .filter(r => r.name && r.surname && !isNaN(r.age) && r.age >= 0)
}

export default function ImportModal({ onClose, onSuccess }: ImportModalProps) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([])
  const [mapping, setMapping] = useState({ name: '', surname: '', age: '' })
  const [parseError, setParseError] = useState('')
  const [status, setStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')

  const rows = mapping.name && mapping.surname && mapping.age
    ? parseRows(rawRows, mapping)
    : []

  function processFile(file: File) {
    setParseError('')
    setRawRows([])
    setHeaders([])
    setMapping({ name: '', surname: '', age: '' })
    setFileName(file.name)

    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'json') {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const parsed = JSON.parse(e.target?.result as string)
          const arr: Record<string, unknown>[] = Array.isArray(parsed) ? parsed : [parsed]
          if (!arr.length) throw new Error('Empty array')
          const hdrs = Object.keys(arr[0])
          setHeaders(hdrs)
          setRawRows(arr)
          setMapping({
            name: detectColumn(hdrs, NAME_ALIASES),
            surname: detectColumn(hdrs, SURNAME_ALIASES),
            age: detectColumn(hdrs, AGE_ALIASES),
          })
        } catch {
          setParseError(t('patients.import_parse_error'))
        }
      }
      reader.readAsText(file)
    } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const wb = XLSX.read(e.target?.result, { type: 'binary' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const arr = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
          if (!arr.length) throw new Error('Empty sheet')
          const hdrs = Object.keys(arr[0])
          setHeaders(hdrs)
          setRawRows(arr)
          setMapping({
            name: detectColumn(hdrs, NAME_ALIASES),
            surname: detectColumn(hdrs, SURNAME_ALIASES),
            age: detectColumn(hdrs, AGE_ALIASES),
          })
        } catch {
          setParseError(t('patients.import_parse_error'))
        }
      }
      reader.readAsBinaryString(file)
    } else {
      setParseError(t('patients.import_parse_error'))
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  async function handleImport() {
    if (!rows.length) return
    setStatus('importing')
    try {
      await apiClient.post('/proxy/mongo/patients', {
        operation: 'insertMany',
        documents: rows,
      })
      setStatus('success')
      setStatusMsg(t('patients.import_success', { count: rows.length }))
      setTimeout(() => { onSuccess(); onClose() }, 1500)
    } catch (err: unknown) {
      setStatus('error')
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      const isLimit = String(msg).toLowerCase().includes('limit')
      setStatusMsg(isLimit ? t('patients.import_limit_error') : t('patients.import_error'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{t('patients.import_title')}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{t('patients.import_subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-blue-400 bg-blue-50'
                : fileName
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".json,.xlsx,.xls,.csv"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]) }}
            />
            {fileName ? (
              <div className="flex items-center justify-center gap-3">
                {fileName.endsWith('.json')
                  ? <FileJson size={28} className="text-emerald-500" />
                  : <FileSpreadsheet size={28} className="text-emerald-500" />}
                <div className="text-left">
                  <p className="font-medium text-slate-700">{fileName}</p>
                  <p className="text-sm text-slate-400">{rawRows.length} {t('patients.col_age') !== 'Age' ? 'строк' : 'rows'}</p>
                </div>
              </div>
            ) : (
              <>
                <Upload size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">{t('patients.import_drop')}</p>
                <p className="text-slate-400 text-sm mt-1">{t('patients.import_formats')}</p>
              </>
            )}
          </div>

          {parseError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg text-sm">
              <AlertCircle size={16} />
              {parseError}
            </div>
          )}

          {/* Column mapping */}
          {headers.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">{t('patients.import_col_map')}</p>
              <div className="grid grid-cols-3 gap-3">
                {(['name', 'surname', 'age'] as const).map(field => (
                  <div key={field}>
                    <label className="block text-xs text-slate-500 mb-1">
                      {t(`patients.import_map_${field}`)}
                    </label>
                    <select
                      value={mapping[field]}
                      onChange={e => setMapping(m => ({ ...m, [field]: e.target.value }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="">—</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-700">{t('patients.import_preview')}</p>
                <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {t('patients.import_total', { count: rows.length })}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2.5 text-left">{t('patients.col_name')}</th>
                      <th className="px-4 py-2.5 text-left">{t('patients.col_surname')}</th>
                      <th className="px-4 py-2.5 text-left">{t('patients.col_age')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 font-medium text-slate-700">{r.name}</td>
                        <td className="px-4 py-2.5 text-slate-600">{r.surname}</td>
                        <td className="px-4 py-2.5 text-slate-500">{r.age}</td>
                      </tr>
                    ))}
                    {rows.length > 5 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-center text-xs text-slate-400">
                          +{rows.length - 5} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Status messages */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-lg text-sm"
              >
                <CheckCircle2 size={16} />
                {statusMsg}
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg text-sm"
              >
                <AlertCircle size={16} />
                {statusMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={status === 'importing'}>
              {t('patients.cancel')}
            </Button>
            <Button
              onClick={handleImport}
              disabled={rows.length === 0 || status === 'importing' || status === 'success'}
              className="min-w-[160px]"
            >
              {status === 'importing' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {t('patients.import_importing')}
                </span>
              ) : (
                rows.length > 0
                  ? t('patients.import_confirm', { count: rows.length })
                  : t('patients.import')
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
