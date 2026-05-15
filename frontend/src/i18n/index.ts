import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ru from './locales/ru.json'
import cs from './locales/cs.json'

const savedLang = localStorage.getItem('his_lang') ?? 'ru'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      cs: { translation: cs },
    },
    lng: savedLang,
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
  })

export default i18n
