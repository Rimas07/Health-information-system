import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'cs', label: 'CS' },
]

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { i18n } = useTranslation()

  function change(code: string) {
    i18n.changeLanguage(code)
    localStorage.setItem('his_lang', code)
  }

  return (
    <div className={`flex gap-1 ${className}`}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => change(code)}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            i18n.language === code
              ? 'bg-slate-800 text-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
