import enTranslation from '@translations/en';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

//
// For now app only has english language but we already use i18n library to be preapared for translations
// Translation files are found from translations folder
//

const resources = {
  en: enTranslation,
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en',

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
