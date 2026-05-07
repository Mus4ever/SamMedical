import { MessageSquare, Phone, Mail, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNotificationLogs, useResendNotifications } from '../../hooks/queries/useNotifications';
import { formatDateTime } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

const typeConfig = {
  sms:   { icon: MessageSquare, label: 'SMS',   color: 'mint'  },
  call:  { icon: Phone,         label: 'Appel', color: 'sky'   },
  email: { icon: Mail,          label: 'Email', color: 'amber' },
};

const statusConfig = {
  sent:      { icon: CheckCircle2, label: 'Envoyé',    color: 'text-mint-700 bg-mint-100' },
  delivered: { icon: CheckCircle2, label: 'Délivré',   color: 'text-mint-700 bg-mint-100' },
  initiated: { icon: Clock,        label: 'Initié',    color: 'text-sky-600 bg-sky-100'   },
  queued:    { icon: Clock,        label: 'En attente', color: 'text-amber-500 bg-amber-100' },
  failed:    { icon: XCircle,      label: 'Échec',     color: 'text-red-600 bg-red-50'    },
};

const colorMap = {
  mint:  'bg-mint-100 text-mint-700',
  sky:   'bg-sky-100 text-sky-600',
  amber: 'bg-amber-100 text-amber-500',
};

const NotificationLogsModal = ({ open, onClose, bilanId, bilanTitle }) => {
  const { data, isLoading } = useNotificationLogs(open ? bilanId : null);
  const resend = useResendNotifications();
  const logs = data?.logs ?? [];

  const handleResend = async () => {
    try {
      await resend.mutateAsync(bilanId);
      toast.success('Notifications relancées');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Historique des notifications" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Bilan : <span className="text-ink font-medium">{bilanTitle}</span>
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <Mail className="w-10 h-10 mx-auto text-muted/40 mb-3" />
            <p className="text-sm">Aucune notification envoyée pour ce bilan.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => {
              const tc = typeConfig[log.type] || typeConfig.sms;
              const sc = statusConfig[log.status] || statusConfig.queued;
              const TIcon = tc.icon;
              const SIcon = sc.icon;
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-2xl border border-ink/5 bg-paper/60">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', colorMap[tc.color])}>
                    <TIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-ink">{tc.label}</span>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs', sc.color)}>
                        <SIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1 mono">{formatDateTime(log.created_at)}</p>
                    {log.provider_id && (
                      <p className="text-[10px] text-muted/70 mt-0.5 mono truncate">SID: {log.provider_id}</p>
                    )}
                    {log.error_message && (
                      <p className="text-xs text-red-600 mt-1">{log.error_message}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-ink/5">
          <Button variant="secondary" onClick={onClose}>Fermer</Button>
          <Button onClick={handleResend} disabled={resend.isPending}>
            <RefreshCw className={cn('w-3.5 h-3.5 mr-2', resend.isPending && 'animate-spin')} />
            {resend.isPending ? 'Envoi...' : 'Relancer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationLogsModal;
