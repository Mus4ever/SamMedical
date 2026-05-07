import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';

const AppNavbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-ink/5 bg-paper/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-2">
          {user && (
            <Link
              to="/profile"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-ink/5 rounded-full transition"
            >
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-mint-200 to-mint-500 text-paper flex items-center justify-center text-xs font-medium">
                {user.fullName?.charAt(0).toUpperCase()}
              </span>
              <span>{user.fullName}</span>
            </Link>
          )}
          <Link
            to="/profile"
            className="sm:hidden p-2 rounded-full hover:bg-ink/5"
            title="Profil"
          >
            <User className="w-4 h-4" />
          </Link>
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
