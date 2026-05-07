import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, ChevronLeft, ChevronRight, ArrowRight, Send } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BilanStatusBadge from '../../components/admin/BilanStatusBadge';
import NotificationLogsModal from '../../components/admin/NotificationLogsModal';
import BilanViewerModal from '../../components/common/BilanViewerModal';
import { Eye } from 'lucide-react';
import { useAllBilans } from '../../hooks/queries/useBilans';
import { formatDateTime } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

const PAGE_SIZE = 20;

const AllBilans = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [logsBilan, setLogsBilan] = useState(null);
  const [viewerBilan, setViewerBilan] = useState(null);

  const { data, isLoading } = useAllBilans({
    search,
    status: status || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const bilans = data?.bilans ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filters = [
    { value: '',         label: 'Tous'        },
    { value: 'pending',  label: 'En attente'  },
    { value: 'ready',    label: 'Prêts'       },
    { value: 'viewed',   label: 'Consultés'   },
  ];

  return (
    <AdminLayout>
      <div className="mb-8 animate-fade-rise">
        <h1 className="display text-5xl text-ink">Tous les bilans</h1>
        <p className="text-muted text-sm mt-3">
          {total} {total > 1 ? 'bilans enregistrés' : 'bilan enregistré'}.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-rise-delay">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Rechercher par titre ou patient..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-ink/10 bg-white/70 focus:outline-none focus:border-mint-400 focus:bg-white transition"
          />
        </div>
        <div className="flex items-center gap-1 glass rounded-full p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatus(f.value); setPage(0); }}
              className={cn(
                'px-4 py-2 text-xs font-medium rounded-full transition-all',
                status === f.value ? 'bg-ink text-paper' : 'text-muted hover:text-ink hover:bg-white/60'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-3xl shadow-soft overflow-hidden animate-fade-rise-delay-2">
        {isLoading ? (
          <div className="p-16 flex justify-center"><LoadingSpinner /></div>
        ) : bilans.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-mint-100 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-mint-600" />
            </div>
            <p className="text-muted">Aucun bilan trouvé</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/5">
            {bilans.map((b) => (
              <li key={b.id} className="p-5 hover:bg-white/40 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-mint-100 text-mint-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link to={`/admin/patients/${b.patient_id}`} className="font-medium text-ink hover:text-mint-600 transition">
                          {b.title}
                        </Link>
                        <BilanStatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {b.patient_name} <span className="mono">· {b.patient_phone}</span>
                      </p>
                      <p className="text-xs text-muted mt-0.5 mono">
                        {formatDateTime(b.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setViewerBilan(b)}
                      title="Consulter le bilan"
                      className="p-2.5 rounded-xl hover:bg-mint-100 text-muted hover:text-mint-700 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setLogsBilan({ id: b.id, title: b.title })}
                      title="Voir les notifications"
                      className="p-2.5 rounded-xl hover:bg-sky-50 text-muted hover:text-sky-600 transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/admin/patients/${b.patient_id}`}
                      className="p-2.5 rounded-xl hover:bg-ink/5 text-muted hover:text-ink transition"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
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

      <NotificationLogsModal
        open={!!logsBilan}
        onClose={() => setLogsBilan(null)}
        bilanId={logsBilan?.id}
        bilanTitle={logsBilan?.title}
      />
      <BilanViewerModal
        open={!!viewerBilan}
        onClose={() => setViewerBilan(null)}
        bilanId={viewerBilan?.id}
        bilanTitle={viewerBilan?.title}
        fileName={viewerBilan?.file_name}
      />
    </AdminLayout>
  );
};

export default AllBilans;
