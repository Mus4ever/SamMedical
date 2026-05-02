import { Clock, CheckCircle2, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';

const config = {
  pending: { label: 'En attente', icon: Clock,         class: 'bg-amber-50 text-amber-800 border-amber-200' },
  ready:   { label: 'Prêt',       icon: CheckCircle2,  class: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  viewed:  { label: 'Consulté',   icon: Eye,           class: 'bg-blue-50 text-blue-800 border-blue-200' },
};

const BilanStatusBadge = ({ status, size = 'sm' }) => {
  const c = config[status] || config.pending;
  const Icon = c.icon;
  const sizeClass = size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5';
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      sizeClass,
      c.class
    )}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      {c.label}
    </span>
  );
};

export default BilanStatusBadge;
