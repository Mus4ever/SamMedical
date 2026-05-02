import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users } from 'lucide-react';
import { cn } from '../../utils/cn';

const Sidebar = () => {
  const { t } = useTranslation();
  const items = [
    { to: '/admin/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/admin/patients',  label: t('nav.patients'),  icon: Users },
  ];
  return (
    <aside className="hidden md:block w-60 border-r border-ink/10 bg-paper">
      <nav className="p-4 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all',
              isActive
                ? 'bg-ink text-paper'
                : 'text-muted hover:text-ink hover:bg-ink/5'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
