/**
 * Pure SVG bar chart — 14 days of bilans.
 * Computed from a list of bilans (with created_at dates).
 */
const MiniBarChart = ({ bilans = [] }) => {
  const days = 14;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build daily counts
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: d, count: 0 };
  });

  bilans.forEach((b) => {
    const d = new Date(b.created_at);
    d.setHours(0, 0, 0, 0);
    const idx = buckets.findIndex(b2 => b2.date.getTime() === d.getTime());
    if (idx >= 0) buckets[idx].count++;
  });

  const max = Math.max(1, ...buckets.map(b => b.count));
  const total = buckets.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="glass rounded-3xl p-6 shadow-soft h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow text-muted">Bilans · 14 derniers jours</p>
          <p className="display text-3xl mt-2 mono">{total}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-mint-100 text-mint-700 font-medium">
          {((total / days)).toFixed(1)}/jour
        </span>
      </div>

      <svg viewBox="0 0 280 100" className="w-full mt-4" preserveAspectRatio="none">
        {buckets.map((b, i) => {
          const h = (b.count / max) * 80;
          const x = i * 20 + 2;
          const y = 90 - h;
          const isToday = i === days - 1;
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={16} height={h || 2}
                rx={4}
                fill={isToday ? '#22C55E' : '#BBF7D0'}
                className="transition-all"
              >
                <title>{b.date.toLocaleDateString('fr-FR')} · {b.count} bilan{b.count > 1 ? 's' : ''}</title>
              </rect>
            </g>
          );
        })}
        {/* Baseline */}
        <line x1="0" y1="90" x2="280" y2="90" stroke="rgba(10,10,10,0.05)" strokeWidth="0.5" />
      </svg>

      <div className="flex items-center justify-between text-[10px] text-muted mt-2 mono">
        <span>{buckets[0].date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
        <span>Aujourd'hui</span>
      </div>
    </div>
  );
};

export default MiniBarChart;
