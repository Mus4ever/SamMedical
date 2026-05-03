import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';
import Button from './Button';
import { cn } from '../../utils/cn';

const PublicNavbar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const menu = [
    { href: '#patients', label: t('nav.patients') },
    { href: '#doctors',  label: t('nav.doctors') },
    { href: '#trust',    label: t('nav.trust') },
    { href: '#faq',      label: t('nav.faq') },
  ];

  return (
    <nav className={cn('fixed top-0 inset-x-0 z-50 transition-all duration-300', scrolled ? 'glass shadow-soft' : 'bg-transparent')}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
        <Logo />

        <ul className="hidden md:flex items-center gap-1 glass rounded-full px-2 py-1.5">
          {menu.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="px-4 py-2 text-sm text-muted hover:text-ink rounded-full hover:bg-white/60 transition-all"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {user ? (
            <Button as={Link} to={user.role === 'admin' ? '/admin/dashboard' : '/patient/bilans'} size="sm" className="hidden sm:inline-flex">
              {t('nav.dashboard')} <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button as={Link} to="/login" size="sm" className="hidden sm:inline-flex">
              {t('nav.login')} <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          )}
          <button
            className="md:hidden p-2 rounded-full hover:bg-ink/5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-ink/5 px-6 py-4 animate-fade-in">
          <ul className="space-y-1">
            {menu.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm text-ink hover:bg-white/60 rounded-xl transition"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pt-2 border-t border-ink/5">
              <Button as={Link} to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/patient/bilans') : '/login'} className="w-full">
                {user ? t('nav.dashboard') : t('nav.login')}
              </Button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
