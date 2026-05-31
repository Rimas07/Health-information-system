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

const VIDEO_URL = "/dna-bg.mp4";

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

const titles: Record<string, string> = {
  en: 'Modern Hospital\nInformation System',
  ru: 'Современная медицинская\nинформационная система',
  cs: 'Moderní nemocniční\ninformační systém',
}

const inputCls =
  'h-11 bg-white/10 border border-white/20 text-white placeholder:text-white/35 ' +
  'focus-visible:ring-white/20 focus-visible:border-white/50 rounded-xl'

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

  const lang = i18n.language
  const labels = featureLabels[lang] ?? featureLabels['en']
  const titleText = titles[lang] ?? titles['en']

  return (
    <div
      className="relative h-screen overflow-hidden bg-black text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Video background ── */}
      <video
        autoPlay loop muted playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* ── Dark overlay (uniform for form readability) ── */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(10,10,40,0.72) 0%, rgba(20,5,35,0.68) 100%)' }}
      />

      {/* ── Bottom blur accent ── */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 40%)',
          maskImage: 'linear-gradient(to top, black 0%, transparent 40%)',
        }}
      />

      {/* ── Main layout ── */}
      <div className="relative z-10 h-full flex items-center justify-center lg:justify-between px-6 sm:px-10 lg:px-20 py-8 gap-12">

        {/* ── Left branding (desktop only) ── */}
        <div className="hidden lg:flex flex-col justify-center flex-1 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-2xl">
              🏥
            </div>
            <div>
              <p className="text-white font-bold text-xl">{t('app.title')}</p>
              <p className="text-white/45 text-sm">{t('app.subtitle')}</p>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white text-5xl font-normal mb-10 whitespace-pre-line"
            style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            {titleText}
          </motion.h2>

          <div className="space-y-4">
            {features.map(({ icon: Icon, key }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.45 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-white/70" />
                </div>
                <span className="text-white/65 text-sm">{labels[key]}</span>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-white/20 text-xs mt-16"
          >
            © 2026 HIS System
          </motion.p>
        </div>

        {/* ── Glass form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-md"
        >
          <div className="liquid-glass-strong rounded-3xl p-8">

            {/* Card header */}
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="text-white text-xl font-semibold">
                  {tab === 'login' ? t('login.tab_login') : t('login.tab_register')}
                </h2>
                <p className="text-white/45 text-sm mt-0.5">
                  {tab === 'login'
                    ? (lang === 'ru' ? 'Введите ваши данные' : lang === 'cs' ? 'Zadejte své údaje' : 'Enter your credentials')
                    : (lang === 'ru' ? 'Создайте организацию' : lang === 'cs' ? 'Vytvořte organizaci' : 'Create your organization')}
                </p>
              </div>
              <LanguageSwitcher />
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-xl bg-white/10 p-1 mb-6 gap-1">
              {(['login', 'register'] as Tab[]).map((t_tab) => (
                <button
                  key={t_tab}
                  onClick={() => setTab(t_tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    tab === t_tab
                      ? 'bg-white/20 text-white'
                      : 'text-white/45 hover:text-white/70'
                  }`}
                >
                  {t_tab === 'login' ? t('login.tab_login') : t('login.tab_register')}
                </button>
              ))}
            </div>

            {/* Forms */}
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
                    <Label htmlFor="email" className="text-white/75 font-medium text-sm">
                      {t('login.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@hospital.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-white/75 font-medium text-sm">
                      {t('login.password')}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-red-300 bg-red-500/15 border border-red-400/20 px-3 py-2.5 rounded-xl"
                    >
                      <span>⚠️</span>
                      {loginError}
                    </motion.div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-white text-slate-900 font-semibold rounded-xl mt-2 hover:bg-white/90 transition-all"
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
                    <Label htmlFor="company" className="text-white/75 font-medium text-sm">
                      {t('login.company')}
                    </Label>
                    <Input
                      id="company"
                      placeholder="City Hospital"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      className={inputCls}
                      minLength={2}
                      maxLength={15}
                      required
                    />
                    <p className="text-xs text-white/35">{t('login.company_hint')}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name" className="text-white/75 font-medium text-sm">
                      {t('login.your_name')}
                    </Label>
                    <Input
                      id="reg-name"
                      placeholder="Ivan Ivanov"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={inputCls}
                      minLength={2}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-white/75 font-medium text-sm">
                      {t('login.admin_email')}
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="admin@hospital.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password" className="text-white/75 font-medium text-sm">
                      {t('login.password')}
                    </Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder={t('login.min_password')}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={inputCls}
                      minLength={6}
                      required
                    />
                  </div>
                  {regError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-red-300 bg-red-500/15 border border-red-400/20 px-3 py-2.5 rounded-xl"
                    >
                      <span>⚠️</span>
                      {regError}
                    </motion.div>
                  )}
                  {regSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-green-300 bg-green-500/15 border border-green-400/20 px-3 py-2.5 rounded-xl"
                    >
                      <span>✅</span>
                      {regSuccess}
                    </motion.div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-white text-slate-900 font-semibold rounded-xl mt-2 hover:bg-white/90 transition-all"
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
