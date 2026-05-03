import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight, Phone, Mail, FileText } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PatientForm from '../../components/admin/PatientForm';
import { usePatientsList } from '../../hooks/queries/usePatients';
import { formatDate } from '../../utils/formatDate';

const PAGE_SIZE = 20;

const Patients = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = usePatientsList({
    search,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const patients = data?.patients ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 animate-fade-rise">
        <div>
          <h1 className="font-serif text-5xl text-ink" style={{ letterSpacing: '-1.5px', lineHeight: 1 }}>
            Patients
          </h1>
          <p className="text-muted text-sm mt-3">
            {total} {total > 1 ? 'patients enregistrés' : 'patient enregistré'}.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />Nouveau patient
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 animate-fade-rise-delay">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Rechercher par nom ou téléphone..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-ink/10 bg-white/70 focus:outline-none focus:border-mint-400 focus:bg-white transition"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-3xl shadow-soft overflow-hidden animate-fade-rise-delay-2">
        {isLoading ? (
          <div className="p-16 flex justify-center"><LoadingSpinner /></div>
        ) : patients.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-mint-100 flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-mint-600" />
            </div>
            <p className="text-muted mb-1">Aucun patient trouvé</p>
            {!search && (
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
                    <div className="text-sm text-ink flex items-center gap-1.5"><Phone className="w-3 h-3 text-muted" />{p.phone}</div>
                    {p.email && (
                      <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5"><Mail className="w-3 h-3" />{p.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-sm text-ink px-2.5 py-1 rounded-full bg-sky-50 border border-sky-100">
                      <FileText className="w-3 h-3 text-sky-600" />
                      {p.bilan_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-muted">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/patients/${p.id}`}
                      className="text-sm text-mint-700 hover:text-mint-600 font-medium transition"
                    >
                      Ouvrir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted">Page {page + 1} / {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-xl glass disabled:opacity-30 hover:bg-white/80 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-xl glass disabled:opacity-30 hover:bg-white/80 transition"
            >
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
