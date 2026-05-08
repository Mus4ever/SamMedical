import { useTranslation } from 'react-i18next';
import { Inbox, Sparkles, FileCheck2, Eye, Calendar } from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BilanCard from '../../components/patient/BilanCard';
import { useMyBilans } from '../../hooks/queries/useBilans';
import { useAuth } from '../../hooks/useAuth';
import { useSeo } from '../../hooks/useSeo';

const MyBilans = () => {
  useSeo({ title: 'Mes résultats', description: 'Consultez vos bilans médicaux en toute confidentialité.' });

  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, isLoading, error } = useMyBilans();

  const bilans = data?.bilans ?? [];
  const newCount    = bilans.filter(b => b.status === 'ready').length;
  const viewedCount = bilans.filter(b => b.status === 'viewed').length;
  const total       = bilans.length;

  return (
    <PatientLayout>
      {/* Header */}
      <header className="mb-10 animate-fade-rise">
        {newCount > 0 && (
          <div className="inline-flex items-center gap-2 glass-mint rounded-full px-3 py-1.5 text-xs text-mint-700 font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {newCount} nouveau{newCount > 1 ? 'x' : ''} résultat{newCount > 1 ? 's' : ''}
          </div>
        )}
        <p className="eyebrow text-muted">{user?.fullName}</p>
        <h1 className="display text-5xl sm:text-6xl text-ink mt-2">{t('nav.bilans')}</h1>
      </header>

      {/* Summary card */}
      {total > 0 && (
        <div className="glass rounded-3xl p-6 mb-8 grid grid-cols-3 gap-4 animate-fade-rise-delay">
          <div className="text-center">
            <div className="w-10 h-10 rounded-2xl bg-mint-100 text-mint-700 flex items-center justify-center mx-auto mb-2">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <p className="display text-3xl text-ink mono">{total}</p>
            <p className="text-[10px] eyebrow text-muted mt-1">Bilans</p>
          </div>
          <div className="text-center border-x border-ink/5">
            <div className="w-10 h-10 rounded-2xl bg-mint-100 text-mint-700 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="display text-3xl text-ink mono">{newCount}</p>
            <p className="text-[10px] eyebrow text-muted mt-1">Nouveaux</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2">
              <Eye className="w-4 h-4" />
            </div>
            <p className="display text-3xl text-ink mono">{viewedCount}</p>
            <p className="text-[10px] eyebrow text-muted mt-1">Consultés</p>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : error ? (
        <div className="glass rounded-3xl p-12 text-center text-muted">Erreur lors du chargement.</div>
      ) : bilans.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-mint-100 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-7 h-7 text-mint-600" />
          </div>
          <p className="display text-2xl text-ink mb-2">Aucun résultat pour le moment</p>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            Vos bilans apparaîtront ici dès qu'ils seront prêts. Vous serez notifié(e) par SMS, appel et email.
          </p>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-rise-delay-2">
          {bilans.map((b) => <BilanCard key={b.id} bilan={b} />)}
        </div>
      )}
    </PatientLayout>
  );
};

export default MyBilans;
