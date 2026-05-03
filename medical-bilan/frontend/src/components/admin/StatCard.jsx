import { cn } from '../../utils/cn';

const StatCard = ({ label, value, icon: Icon, accent = 'mint', hint }) => {
  const accents = {
    mint:  'bg-mint-100 text-mint-700',
    sky:   'bg-sky-100 text-sky-600',
    amber: 'bg-amber-100 text-amber-500',
    peach: 'bg-peach-100 text-peach-400',
  };
  return (
    <div className="glass rounded-3xl p-6 shadow-soft lift">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
          <p className="font-serif text-4xl text-ink mt-2" style={{ letterSpacing: '-0.5px' }}>
            {value === undefined || value === null ? '—' : value}
          </p>
          {hint && <p className="text-xs text-muted mt-1.5">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0', accents[accent])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
