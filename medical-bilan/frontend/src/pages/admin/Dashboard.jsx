import { Link } from 'react-router-dom';
import { Users, FileText, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import BilanStatusBadge from '../../components/admin/BilanStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { usePatientsList } from '../../hooks/queries/usePatients';
import { useAllBilans } from '../../hooks/queries/useBilans';
import { formatRelative } from '../../utils/formatDate';

const Dashboard = () => {
  const patientsQ = usePatientsList({ limit: 1 });
  const allBilansQ = useAllBilans({ limit: 200 });
  const recentBilansQ = useAllBilans({ limit: 5 });

  const totalPatients = patientsQ.data?.total ?? null;
  const allBilans     = allBilansQ.data?.bilans ?? [];
  const pendingCount  = allBilans.filter(b => b.status === 'pending').length;
  const readyCount    = allBilans.filter(b => b.status === 'ready').length;
  const totalBilans   = allBilansQ.data?.total ?? null;

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-5xl text-ink" style={{ letterSpacing: '-1px' }}>
          Tableau de bord
        </h1>
        <p className="text-muted text-sm mt-2">Aperçu de l'activité de la clinique.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Patients"       value={totalPatients}  icon={Users}        accent="bg-blue-50 text-blue-700" />
        <StatCard label="Total bilans"   value={totalBilans}    icon={FileText}     accent="bg-ink/5 text-ink" />
        <StatCard label="En attente"     value={pendingCount}   icon={Clock}        accent="bg-amber-50 text-amber-700" hint="À marquer comme prêts" />
        <StatCard label="Notifiés"       value={readyCount}     icon={CheckCircle2} accent="bg-emerald-50 text-emerald-700" hint="Prêts pour le patient" />
      </div>

      {/* Recent bilans */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl text-ink">Derniers bilans</h2>
          <Link to="/admin/patients" className="text-sm text-muted hover:text-ink inline-flex items-center gap-1 transition">
            Voir les patients <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-paper overflow-hidden">
          {recentBilansQ.isLoading ? (
            <div className="p-12 flex justify-center"><LoadingSpinner /></div>
          ) : recentBilansQ.data?.bilans?.length === 0 ? (
            <div className="p-12 text-center text-muted">Aucun bilan pour le moment</div>
          ) : (
            <ul className="divide-y divide-ink/5">
              {recentBilansQ.data?.bilans.map((b) => (
                <li key={b.id}>
                  <Link
                    to={`/admin/patients/${b.patient_id}`}
                    className="flex items-center gap-4 p-4 hover:bg-ink/[0.02] transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink truncate">{b.title}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {b.patient_name} · {formatRelative(b.created_at)}
                      </p>
                    </div>
                    <BilanStatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
