import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frCommon from './locales/fr/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: frCommon },
    },
    lng: 'fr',
    fallbackLng: 'fr',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  });

document.documentElement.lang = 'fr';
document.documentElement.dir = 'ltr';

export default i18n;
