import { cn } from '../../utils/cn';

const StatCard = ({ label, value, icon: Icon, accent, hint }) => (
  <div className="p-6 rounded-2xl border border-ink/10 bg-paper hover:border-ink/30 transition-colors">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        <p className="font-serif text-4xl text-ink mt-2">
          {value === undefined || value === null ? '—' : value}
        </p>
        {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
      </div>
      {Icon && (
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          accent || 'bg-ink/5 text-ink'
        )}>
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
