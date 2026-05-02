import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

/**
 * Compact FR/AR pill switcher.
 * Stores the choice in localStorage via i18next-browser-languagedetector.
 */
const LanguageSwitcher = ({ className, dark = false }) => {
  const { i18n } = useTranslation();
  const langs = [
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'ع' },
  ];
  return (
    <div className={cn(
      'inline-flex items-center rounded-full p-0.5',
      dark ? 'bg-white/10' : 'bg-ink/5',
      className
    )}>
      {langs.map((lng) => (
        <button
          key={lng.code}
          onClick={() => i18n.changeLanguage(lng.code)}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-full transition-all',
            i18n.language === lng.code
              ? (dark ? 'bg-paper text-ink' : 'bg-ink text-paper')
              : (dark ? 'text-paper/70 hover:text-paper' : 'text-muted hover:text-ink')
          )}
        >
          {lng.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
