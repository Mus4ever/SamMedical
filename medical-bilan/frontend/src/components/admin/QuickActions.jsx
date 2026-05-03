import { Link } from 'react-router-dom';
import { UserPlus, Search, FileText, ArrowRight } from 'lucide-react';

const actions = [
  { label: 'Nouveau patient', href: '/admin/patients?new=1', icon: UserPlus, color: 'mint'  },
  { label: 'Voir les patients', href: '/admin/patients',     icon: Search,   color: 'sky'   },
  { label: 'Tous les bilans',   href: '/admin/patients',     icon: FileText, color: 'amber' },
];

const colorMap = {
  mint:  'bg-mint-100 text-mint-700 group-hover:bg-mint-500 group-hover:text-paper',
  sky:   'bg-sky-100 text-sky-600 group-hover:bg-sky-500 group-hover:text-paper',
  amber: 'bg-amber-100 text-amber-500 group-hover:bg-amber-500 group-hover:text-paper',
};

const QuickActions = () => (
  <div className="glass rounded-3xl p-6 shadow-soft">
    <h3 className="font-medium text-ink mb-4">Actions rapides</h3>
    <div className="space-y-2">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.label}
            to={a.href}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/60 transition group"
          >
            <div className={`w-10 h-10 rounded-xl ${colorMap[a.color]} flex items-center justify-center transition-all`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="flex-1 text-sm font-medium text-ink">{a.label}</span>
            <ArrowRight className="w-4 h-4 text-ink/30 group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
          </Link>
        );
      })}
    </div>
  </div>
);

export default QuickActions;
