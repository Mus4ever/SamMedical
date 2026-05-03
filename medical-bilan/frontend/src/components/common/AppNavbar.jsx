import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';

const AppNavbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-ink/5 bg-paper/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:inline text-sm text-muted">{user.fullName}</span>
          )}
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition px-3 py-2 rounded-full hover:bg-ink/5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppNavbar;
