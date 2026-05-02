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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-5xl text-ink" style={{ letterSpacing: '-1px' }}>
            Patients
          </h1>
          <p className="text-muted text-sm mt-2">
            {total} {total > 1 ? 'patients' : 'patient'} enregistré{total > 1 ? 's' : ''}.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau patient
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Rechercher par nom ou téléphone..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-ink transition bg-paper"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-ink/10 bg-paper overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex justify-center"><LoadingSpinner /></div>
        ) : patients.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-muted">Aucun patient trouvé.</p>
            {!search && (
              <Button variant="secondary" onClick={() => setShowForm(true)} className="mt-4">
                Créer le premier patient
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wider text-muted">
                <th className="text-left px-6 py-4 font-medium">Nom</th>
                <th className="text-left px-6 py-4 font-medium hidden md:table-cell">Contact</th>
                <th className="text-left px-6 py-4 font-medium hidden lg:table-cell">Bilans</th>
                <th className="text-left px-6 py-4 font-medium hidden lg:table-cell">Inscrit le</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-ink/[0.02] transition">
                  <td className="px-6 py-4">
                    <Link to={`/admin/patients/${p.id}`} className="font-medium text-ink hover:underline">
                      {p.full_name}
                    </Link>
                    {!p.is_active && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">
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
                    <span className="inline-flex items-center gap-1.5 text-sm text-ink">
                      <FileText className="w-3.5 h-3.5 text-muted" />
                      {p.bilan_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-muted">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/patients/${p.id}`}
                      className="text-sm text-ink hover:underline"
                    >
                      Ouvrir
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
          <p className="text-xs text-muted">
            Page {page + 1} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-ink/15 disabled:opacity-30 hover:bg-ink/5 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-ink/15 disabled:opacity-30 hover:bg-ink/5 transition"
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
