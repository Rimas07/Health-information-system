import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Shield, Activity, Users, Lock } from 'lucide-react'
import { apiClient } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import type { AuthResponse } from '@/types'

type Tab = 'login' | 'register'

const features = [
  { icon: Shield, key: 'security' },
  { icon: Activity, key: 'realtime' },
  { icon: Users, key: 'multitenant' },
  { icon: Lock, key: 'audit' },
]

const featureLabels: Record<string, Record<string, string>> = {
  en: {
    security: 'Enterprise-grade security',
    realtime: 'Real-time monitoring',
    multitenant: 'Multi-tenant architecture',
    audit: 'Full audit logging',
  },
  ru: {
    security: 'Корпоративная безопасность',
    realtime: 'Мониторинг в реальном времени',
    multitenant: 'Мультитенантная архитектура',
    audit: 'Полный журнал аудита',
  },
  cs: {
    security: 'Podnikové zabezpečení',
    realtime: 'Monitoring v reálném čase',
    multitenant: 'Multi-tenant architektura',
    audit: 'Kompletní protokol auditu',
  },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
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

  const labels = featureLabels[i18n.language] ?? featureLabels['en']

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
              🏥
            </div>
            <span className="text-white font-bold text-xl">{t('app.title')}</span>
          </div>
          <p className="text-blue-300/70 text-sm">{t('app.subtitle')}</p>
        </div>

        <div className="relative space-y-6">
          <div>
            <h2 className="text-white text-3xl font-bold leading-tight mb-3">
              {i18n.language === 'ru' && 'Современная медицинская\nинформационная система'}
              {i18n.language === 'en' && 'Modern Hospital\nInformation System'}
              {i18n.language === 'cs' && 'Moderní nemocniční\ninformační systém'}
            </h2>
          </div>
          <div className="space-y-3">
            {features.map(({ icon: Icon, key }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-blue-500/20 border border-blue-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-blue-400" />
                </div>
                <span className="text-slate-300 text-sm">{labels[key]}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-xs">© 2026 HIS System</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-4xl mb-2">🏥</div>
            <h1 className="text-2xl font-bold text-slate-800">{t('app.title')}</h1>
            <p className="text-slate-500 text-sm">{t('login.subtitle')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {tab === 'login' ? t('login.tab_login') : t('login.tab_register')}
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  {tab === 'login'
                    ? (i18n.language === 'ru' ? 'Введите ваши данные' : i18n.language === 'cs' ? 'Zadejte své údaje' : 'Enter your credentials')
                    : (i18n.language === 'ru' ? 'Создайте организацию' : i18n.language === 'cs' ? 'Vytvořte organizaci' : 'Create your organization')}
                </p>
              </div>
              <LanguageSwitcher />
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6 gap-1">
              {(['login', 'register'] as Tab[]).map((t_tab) => (
                <button
                  key={t_tab}
                  onClick={() => setTab(t_tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
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
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-slate-700 font-medium">{t('login.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@hospital.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-slate-700 font-medium">{t('login.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                      required
                    />
                  </div>
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg"
                    >
                      <span className="text-base">⚠️</span>
                      {loginError}
                    </motion.div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-slate-900 hover:bg-slate-700 text-white font-medium rounded-xl mt-2 transition-all"
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        {t('login.signing_in')}
                      </span>
                    ) : t('login.sign_in')}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-slate-700 font-medium">{t('login.company')}</Label>
                    <Input
                      id="company"
                      placeholder="City Hospital"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      className="h-11 border-slate-200"
                      minLength={2}
                      maxLength={15}
                      required
                    />
                    <p className="text-xs text-slate-400">{t('login.company_hint')}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name" className="text-slate-700 font-medium">{t('login.your_name')}</Label>
                    <Input
                      id="reg-name"
                      placeholder="Ivan Ivanov"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="h-11 border-slate-200"
                      minLength={2}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-slate-700 font-medium">{t('login.admin_email')}</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="admin@hospital.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="h-11 border-slate-200"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password" className="text-slate-700 font-medium">{t('login.password')}</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder={t('login.min_password')}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="h-11 border-slate-200"
                      minLength={6}
                      required
                    />
                  </div>
                  {regError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg"
                    >
                      <span className="text-base">⚠️</span>
                      {regError}
                    </motion.div>
                  )}
                  {regSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 px-3 py-2.5 rounded-lg"
                    >
                      <span className="text-base">✅</span>
                      {regSuccess}
                    </motion.div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-slate-900 hover:bg-slate-700 text-white font-medium rounded-xl mt-2 transition-all"
                    disabled={regLoading}
                  >
                    {regLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        {t('login.creating')}
                      </span>
                    ) : t('login.create_org')}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
