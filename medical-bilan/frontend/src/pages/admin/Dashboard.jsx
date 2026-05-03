import { Users, FileText, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import ActivityFeed from '../../components/admin/ActivityFeed';
import MiniBarChart from '../../components/admin/MiniBarChart';
import QuickActions from '../../components/admin/QuickActions';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { usePatientsList } from '../../hooks/queries/usePatients';
import { useAllBilans } from '../../hooks/queries/useBilans';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const patientsQ = usePatientsList({ limit: 5 });
  const allBilansQ = useAllBilans({ limit: 200 });

  const totalPatients = patientsQ.data?.total ?? null;
  const recentPatients = patientsQ.data?.patients ?? [];
  const allBilans      = allBilansQ.data?.bilans ?? [];
  const pendingCount   = allBilans.filter(b => b.status === 'pending').length;
  const readyCount     = allBilans.filter(b => b.status !== 'pending').length;
  const totalBilans    = allBilansQ.data?.total ?? null;

  if (allBilansQ.isLoading || patientsQ.isLoading) {
    return <AdminLayout><div className="flex justify-center py-20"><LoadingSpinner /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-10 animate-fade-rise">
        <div className="inline-flex items-center gap-2 glass-mint rounded-full px-3 py-1 text-xs text-mint-700 font-medium mb-4">
          <Sparkles className="w-3 h-3" />
          {user?.fullName?.split(' ')[0] ? `Bonjour ${user.fullName.split(' ')[0]}` : 'Bonjour'}
        </div>
        <h1 className="display text-5xl text-ink">Tableau de bord</h1>
        <p className="text-muted text-sm mt-3">Aperçu temps réel de l'activité de la clinique.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Patients"     value={totalPatients} icon={Users}        accent="mint"  />
        <StatCard label="Total bilans" value={totalBilans}   icon={FileText}     accent="sky"   />
        <StatCard label="En attente"   value={pendingCount}  icon={Clock}        accent="amber" hint="À marquer prêts" />
        <StatCard label="Notifiés"     value={readyCount}    icon={CheckCircle2} accent="peach" hint="Envoyés au patient" />
      </div>

      {/* Chart + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
        <div className="lg:col-span-2">
          <MiniBarChart bilans={allBilans} />
        </div>
        <QuickActions />
      </div>

      {/* Activity feed */}
      <div className="mt-8">
        <ActivityFeed bilans={allBilans.slice(0, 10)} patients={recentPatients} />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
