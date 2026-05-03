import { Link } from 'react-router-dom';
import { FileText, UserPlus, Send, Eye } from 'lucide-react';
import { formatRelative } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

/**
 * Generates a synthetic activity timeline from recent bilans + patients.
 */
const ActivityFeed = ({ bilans = [], patients = [] }) => {
  // Synthesize events
  const events = [];
  bilans.forEach((b) => {
    events.push({
      id: `b-create-${b.id}`,
      type: 'create',
      icon: FileText,
      color: 'mint',
      title: `Bilan uploadé pour ${b.patient_name}`,
      sub: b.title,
      ts: b.created_at,
      href: `/admin/patients/${b.patient_id}`,
    });
    if (b.notification_sent_at) {
      events.push({
        id: `b-notif-${b.id}`,
        type: 'notify',
        icon: Send,
        color: 'sky',
        title: `Notifications envoyées à ${b.patient_name}`,
        sub: 'SMS · Appel · Email',
        ts: b.notification_sent_at,
        href: `/admin/patients/${b.patient_id}`,
      });
    }
    if (b.status === 'viewed') {
      events.push({
        id: `b-view-${b.id}`,
        type: 'view',
        icon: Eye,
        color: 'amber',
        title: `${b.patient_name} a consulté son bilan`,
        sub: b.title,
        ts: b.updated_at,
        href: `/admin/patients/${b.patient_id}`,
      });
    }
  });
  patients.slice(0, 5).forEach((p) => {
    events.push({
      id: `p-${p.id}`,
      type: 'patient',
      icon: UserPlus,
      color: 'peach',
      title: `Nouveau patient : ${p.full_name}`,
      sub: p.phone,
      ts: p.created_at,
      href: `/admin/patients/${p.id}`,
    });
  });

  // Sort by date desc, take top 8
  events.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const recent = events.slice(0, 8);

  const colorMap = {
    mint:  'bg-mint-100 text-mint-700',
    sky:   'bg-sky-100 text-sky-600',
    amber: 'bg-amber-100 text-amber-500',
    peach: 'bg-peach-100 text-peach-400',
  };

  if (recent.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center text-muted text-sm">
        Aucune activité récente.
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl shadow-soft overflow-hidden">
      <div className="px-6 py-4 border-b border-ink/5">
        <h3 className="font-medium text-ink">Activité récente</h3>
      </div>
      <ul className="divide-y divide-ink/5">
        {recent.map((e) => {
          const Icon = e.icon;
          return (
            <li key={e.id}>
              <Link to={e.href} className="flex items-start gap-3 p-4 hover:bg-white/40 transition group">
                <div className={cn('w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0', colorMap[e.color])}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink leading-tight truncate">{e.title}</p>
                  <p className="text-xs text-muted mt-0.5 truncate">{e.sub}</p>
                </div>
                <span className="text-[10px] text-muted whitespace-nowrap mono">{formatRelative(e.ts)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ActivityFeed;
