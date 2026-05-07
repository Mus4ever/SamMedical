import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight, Phone, Mail, FileText } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import PatientForm from '../../components/admin/PatientForm';
import { usePatientsList } from '../../hooks/queries/usePatients';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

const PAGE_SIZE = 20;

const Patients = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const activeParam = filter === 'all' ? undefined : (filter === 'active');

  const { data, isLoading } = usePatientsList({
    search,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    active: activeParam,
  });

  const patients = data?.patients ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filterTabs = [
    { value: 'all',      label: 'Tous'        },
    { value: 'active',   label: 'Actifs'      },
    { value: 'inactive', label: 'Désactivés'  },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 animate-fade-rise">
        <div>
          <h1 className="display text-5xl text-ink">Patients</h1>
          <p className="text-muted text-sm mt-3">
            {total} {total > 1 ? 'patients' : 'patient'}
            {filter === 'active' && ' actifs'}
            {filter === 'inactive' && ' désactivés'}
            .
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />Nouveau patient
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-rise-delay">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Rechercher par nom ou téléphone..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-ink/10 bg-white/70 focus:outline-none focus:border-mint-400 focus:bg-white transition"
          />
        </div>
        <div className="flex items-center gap-1 glass rounded-full p-1">
          {filterTabs.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(0); }}
              className={cn(
                'px-4 py-2 text-xs font-medium rounded-full transition-all',
                filter === f.value ? 'bg-ink text-paper' : 'text-muted hover:text-ink hover:bg-white/60'
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/5 text-xs uppercase tracking-wider text-muted">
                <th className="text-left px-6 py-4 font-medium">Nom</th>
                <th className="text-left px-6 py-4 font-medium hidden md:table-cell">Contact</th>
                <th className="text-left px-6 py-4 font-medium hidden lg:table-cell">Bilans</th>
                <th className="text-left px-6 py-4 font-medium hidden lg:table-cell">Inscrit le</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton variant="circle" className="w-8 h-8" />
                      <Skeleton variant="line" className="w-32 h-3" />
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell"><Skeleton variant="line" className="w-28 h-3" /></td>
                  <td className="px-6 py-4 hidden lg:table-cell"><Skeleton variant="line" className="w-12 h-3" /></td>
                  <td className="px-6 py-4 hidden lg:table-cell"><Skeleton variant="line" className="w-20 h-3" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton variant="line" className="w-12 h-3 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : patients.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-mint-100 flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-mint-600" />
            </div>
            <p className="text-muted mb-1">Aucun patient trouvé</p>
            {!search && filter === 'all' && (
              <Button variant="mint" onClick={() => setShowForm(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />Créer le premier patient
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/5 text-xs uppercase tracking-wider text-muted">
                <th className="text-left px-6 py-4 font-medium">Nom</th>
                <th className="text-left px-6 py-4 font-medium hidden md:table-cell">Contact</th>
                <th className="text-left px-6 py-4 font-medium hidden lg:table-cell">Bilans</th>
                <th className="text-left px-6 py-4 font-medium hidden lg:table-cell">Inscrit le</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-white/40 transition">
                  <td className="px-6 py-4">
                    <Link to={`/admin/patients/${p.id}`} className="font-medium text-ink hover:text-mint-600 transition inline-flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-mint-100 text-mint-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {p.full_name.charAt(0).toUpperCase()}
                      </span>
                      {p.full_name}
                    </Link>
                    {!p.is_active && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                        Désactivé
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-sm text-ink flex items-center gap-1.5"><Phone className="w-3 h-3 text-muted" /><span className="mono">{p.phone}</span></div>
                    {p.email && <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5"><Mail className="w-3 h-3" />{p.email}</div>}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-sm text-ink px-2.5 py-1 rounded-full bg-sky-50 border border-sky-100">
                      <FileText className="w-3 h-3 text-sky-600" />
                      <span className="mono">{p.bilan_count}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-muted">{formatDate(p.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/admin/patients/${p.id}`} className="text-sm text-mint-700 hover:text-mint-600 font-medium transition">
                      Ouvrir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      <PatientForm open={showForm} onClose={() => setShowForm(false)} />
    </AdminLayout>
  );
};

export default Patients;
