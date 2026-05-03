import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-cream border-t border-ink/5 overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute -top-40 -right-20 w-96 h-96 bg-mint-200 blob opacity-40" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-sky-100 blob opacity-50" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Logo />
            <p className="text-muted text-sm mt-4 max-w-sm leading-relaxed">
              {t('brand.tagline')}. {t('landing.about.body')}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted mb-4">Navigation</p>
            <ul className="space-y-2 text-sm">
              <li><a href="#home"     className="text-ink hover:text-mint-600 transition">{t('nav.home')}</a></li>
              <li><a href="#services" className="text-ink hover:text-mint-600 transition">{t('nav.services')}</a></li>
              <li><a href="#about"    className="text-ink hover:text-mint-600 transition">{t('nav.about')}</a></li>
              <li><a href="#contact"  className="text-ink hover:text-mint-600 transition">{t('nav.contact')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted mb-4">Contact</p>
            <ul className="space-y-2 text-sm text-ink">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted" /> contact@clinique.dz</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted" /> +213 XXX XXX XXX</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted" /> Alger, Algérie</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ink/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {year} {t('brand.name')}. Tous droits réservés.
          </p>
          <p className="text-xs text-muted">
            Made with care in Algeria 🇩🇿
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
