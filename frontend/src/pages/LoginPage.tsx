import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import type { AuthResponse } from '@/types'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [regCompany, setRegCompany] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      })
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('tenant_id', data.tenantId)
      navigate('/dashboard')
    } catch {
      setLoginError(t('login.error_credentials'))
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegLoading(true)
    setRegError('')
    setRegSuccess('')
    try {
      await apiClient.post('/tenants/create-company', {
        companyName: regCompany,
        user: { name: regName, email: regEmail, password: regPassword },
      })
      setRegSuccess(t('login.success_created'))
      setLoginEmail(regEmail)
      setTimeout(() => setTab('login'), 1500)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setRegError(Array.isArray(msg) ? msg[0] : (msg ?? t('login.error_register')))
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🏥</div>
            <h1 className="text-2xl font-bold text-slate-800">{t('app.title')}</h1>
            <p className="text-slate-500 text-sm mt-1">{t('login.subtitle')}</p>
          </div>

          <div className="flex justify-center mb-4">
            <LanguageSwitcher />
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            {(['login', 'register'] as Tab[]).map((t_tab) => (
              <button
                key={t_tab}
                onClick={() => setTab(t_tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  tab === t_tab
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t_tab === 'login' ? t('login.tab_login') : t('login.tab_register')}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">{t('login.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@hospital.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('login.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                {loginError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg"
                  >
                    {loginError}
                  </motion.p>
                )}
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? t('login.signing_in') : t('login.sign_in')}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="company">{t('login.company')}</Label>
                  <Input
                    id="company"
                    placeholder="City Hospital"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    minLength={2}
                    maxLength={15}
                    required
                  />
                  <p className="text-xs text-slate-400">{t('login.company_hint')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-name">{t('login.your_name')}</Label>
                  <Input
                    id="reg-name"
                    placeholder="Ivan Ivanov"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    minLength={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">{t('login.admin_email')}</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="admin@hospital.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">{t('login.password')}</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder={t('login.min_password')}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
                {regError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg"
                  >
                    {regError}
                  </motion.p>
                )}
                {regSuccess && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg"
                  >
                    {regSuccess}
                  </motion.p>
                )}
                <Button type="submit" className="w-full" disabled={regLoading}>
                  {regLoading ? t('login.creating') : t('login.create_org')}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
