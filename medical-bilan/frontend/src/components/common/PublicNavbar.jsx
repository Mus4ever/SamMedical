import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';
import { cn } from '../../utils/cn';

/**
 * Editorial-style top nav for the landing page.
 * Matches the "Aethera" reference: logo left, menu center-ish, CTA right.
 */
const PublicNavbar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const menu = [
    { href: '#home',     label: t('nav.home'),     active: true },
    { href: '#about',    label: t('nav.about') },
    { href: '#services', label: t('nav.services') },
    { href: '#contact',  label: t('nav.contact') },
  ];

  return (
    <nav className="absolute top-0 inset-x-0 z-20">
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        <Logo />

        <ul className="hidden md:flex items-center gap-8">
          {menu.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={cn(
                  'text-sm transition-colors',
                  item.active ? 'text-ink' : 'text-muted hover:text-ink'
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <Button as={Link} to={user.role === 'admin' ? '/admin/dashboard' : '/patient/bilans'}>
              {t('nav.dashboard')}
            </Button>
          ) : (
            <Button as={Link} to="/login">
              {t('nav.login')}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
