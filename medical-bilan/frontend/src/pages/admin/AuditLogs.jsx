import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronLeft, ChevronRight, FileText, UserPlus, Send, Trash2, KeyRound, Edit3 } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Skeleton from '../../components/common/Skeleton';
import { useAuditLogs } from '../../hooks/queries/useAuditLogs';
import { formatDateTime } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

const PAGE_SIZE = 30;

const actionMeta = {
  'patient.create':         { label: 'Patient créé',           icon: UserPlus,  color: 'mint'  },
  'patient.update':         { label: 'Patient modifié',        icon: Edit3,     color: 'sky'   },
  'patient.reset_password': { label: 'Mot de passe réinitialisé', icon: KeyRound, color: 'amber' },
  'bilan.upload':           { label: 'Bilan uploadé',          icon: FileText,  color: 'mint'  },
  'bilan.mark_ready':       { label: 'Notifications déclenchées', icon: Send,   color: 'sky'   },
  'bilan.delete':           { label: 'Bilan supprimé',         icon: Trash2,   color: 'peach' },
};

const colorMap = {
  mint:  'bg-mint-100 text-mint-700',
  sky:   'bg-sky-100 text-sky-600',
  amber: 'bg-amber-100 text-amber-500',
  peach: 'bg-peach-100 text-peach-400',
};

const AuditLogs = () => {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useAuditLogs({
    action: filter === 'all' ? undefined : filter,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filterTabs = [
    { value: 'all',                       label: 'Tout' },
    { value: 'patient.create',            label: 'Créations' },
    { value: 'bilan.upload',              label: 'Uploads' },
    { value: 'bilan.mark_ready',          label: 'Notifications' },
    { value: 'patient.reset_password',    label: 'Reset mdp' },
    { value: 'bilan.delete',              label: 'Suppressions' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8 animate-fade-rise">
        <div className="inline-flex items-center gap-2 glass-mint rounded-full px-3 py-1 text-xs text-mint-700 font-medium mb-4">
          <Activity className="w-3 h-3" />
          Journal d'audit
        </div>
        <h1 className="display text-5xl text-ink">Journal d'activité</h1>
        <p className="text-muted text-sm mt-3">
          Toutes les actions effectuées par les administrateurs — {total} entrée{total > 1 ? 's' : ''}.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 glass rounded-full p-1 mb-6 overflow-x-auto no-scrollbar animate-fade-rise-delay">
        {filterTabs.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(0); }}
            className={cn(
              'px-4 py-2 text-xs font-medium rounded-full transition-all whitespace-nowrap',
              filter === f.value ? 'bg-ink text-paper' : 'text-muted hover:text-ink hover:bg-white/60'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Logs list */}
      <div className="glass rounded-3xl shadow-soft overflow-hidden animate-fade-rise-delay-2">
        {isLoading ? (
          <ul className="divide-y divide-ink/5">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="flex items-start gap-3 p-4">
                <Skeleton variant="rect" className="w-10 h-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="line" className="w-2/3 h-3" />
                  <Skeleton variant="line" className="w-1/3 h-3" />
                </div>
                <Skeleton variant="line" className="w-16 h-3" />
              </li>
            ))}
          </ul>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-mint-100 flex items-center justify-center mx-auto mb-3">
              <Activity className="w-5 h-5 text-mint-600" />
            </div>
            <p className="text-muted">Aucune activité enregistrée pour ce filtre.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/5">
            {logs.map((log) => {
              const meta = actionMeta[log.action] || { label: log.action, icon: Activity, color: 'mint' };
              const Icon = meta.icon;
              const targetLink = log.target_type === 'bilan' || log.target_type === 'patient'
                ? (log.target_type === 'bilan' ? '/admin/bilans' : `/admin/patients/${log.target_id}`)
                : null;
              const Wrapper = targetLink ? Link : 'div';
              const wrapperProps = targetLink ? { to: targetLink } : {};

              return (
                <li key={log.id}>
                  <Wrapper
                    {...wrapperProps}
                    className={cn(
                      'flex items-start gap-3 p-4 transition',
                      targetLink && 'hover:bg-white/40'
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0', colorMap[meta.color])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{meta.label}</p>
                      <p className="text-xs text-muted mt-0.5">
                        Par <span className="text-ink">{log.actor_name || 'Système'}</span>
                        {log.metadata?.fullName && <> · <span className="text-ink">{log.metadata.fullName}</span></>}
                        {log.metadata?.title && <> · <span className="text-ink">{log.metadata.title}</span></>}
                      </p>
                      {log.metadata?.ip && (
                        <p className="text-[10px] text-muted/70 mt-0.5 mono">IP: {log.metadata.ip}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted whitespace-nowrap mono">
                      {formatDateTime(log.created_at)}
                    </span>
                  </Wrapper>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted mono">Page {page + 1} / {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 rounded-xl glass disabled:opacity-30 hover:bg-white/80 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 rounded-xl glass disabled:opacity-30 hover:bg-white/80 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AuditLogs;
