import { useTranslation } from 'react-i18next';
import Logo from './Logo';

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink/10 py-12 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo />
        <p className="text-xs text-muted">
          © {year} {t('brand.name')}. {t('brand.tagline')}.
        </p>
        <ul className="flex items-center gap-6 text-xs text-muted">
          <li><a href="#about" className="hover:text-ink transition">{t('nav.about')}</a></li>
          <li><a href="#contact" className="hover:text-ink transition">{t('nav.contact')}</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
