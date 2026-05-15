import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'cs', label: 'CS' },
]

export default function LanguageSwitcher({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  const { i18n } = useTranslation()

  function change(code: string) {
    i18n.changeLanguage(code)
    localStorage.setItem('his_lang', code)
  }

  return (
    <div className={`flex gap-1 ${className}`}>
      {LANGS.map(({ code, label }) => {
        const isActive = i18n.language === code
        return (
          <button
            key={code}
            onClick={() => change(code)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              dark
                ? isActive
                  ? 'bg-white/15 text-white'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                : isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
