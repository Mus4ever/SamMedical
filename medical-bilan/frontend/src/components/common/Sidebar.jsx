import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, FileText, User } from 'lucide-react';
import { cn } from '../../utils/cn';

const Sidebar = () => {
  const { t } = useTranslation();
  const items = [
    { to: '/admin/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/admin/patients',  label: t('nav.patients'),  icon: Users },
    { to: '/admin/bilans',    label: 'Tous les bilans',  icon: FileText },
    { to: '/profile',         label: 'Profil',           icon: User },
  ];

  return (
    <aside className="hidden md:block w-64 p-4">
      <div className="glass rounded-3xl p-3 sticky top-24 shadow-soft">
        <nav className="space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all',
                isActive ? 'bg-ink text-paper shadow-soft-lg' : 'text-muted hover:text-ink hover:bg-white/60'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
