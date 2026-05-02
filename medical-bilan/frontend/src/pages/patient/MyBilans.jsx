import { useTranslation } from 'react-i18next';
import { FileText, Inbox } from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BilanCard from '../../components/patient/BilanCard';
import { useMyBilans } from '../../hooks/queries/useBilans';
import { useAuth } from '../../hooks/useAuth';

const MyBilans = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, isLoading, error } = useMyBilans();

  const bilans = data?.bilans ?? [];
  const newCount = bilans.filter(b => b.status === 'ready').length;

  return (
    <PatientLayout>
      {/* Greeting */}
      <header className="mb-12 animate-fade-rise">
        <p className="text-xs uppercase tracking-wider text-muted mb-2">
          {user?.fullName}
        </p>
        <h1 className="font-serif text-5xl text-ink" style={{ letterSpacing: '-1px', lineHeight: 1 }}>
          {t('nav.bilans')}
        </h1>
        {newCount > 0 ? (
          <p className="text-muted mt-3 text-sm">
            Vous avez{' '}
            <span className="text-emerald-700 font-medium">
              {newCount} nouveau{newCount > 1 ? 'x' : ''} résultat{newCount > 1 ? 's' : ''}
            </span>{' '}
            à consulter.
          </p>
        ) : bilans.length > 0 ? (
          <p className="text-muted mt-3 text-sm">Tous vos bilans sont à jour.</p>
        ) : null}
      </header>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : error ? (
        <div className="text-center py-12 text-muted">
          Erreur lors du chargement de vos bilans.
        </div>
      ) : bilans.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-7 h-7 text-muted" />
          </div>
          <p className="font-serif text-2xl text-ink mb-2">Aucun résultat pour le moment</p>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Vos bilans apparaîtront ici dès qu'ils seront prêts. Vous serez notifié(e)
            par SMS, appel et email.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-rise-delay">
          {bilans.map((b) => (
            <BilanCard key={b.id} bilan={b} />
          ))}
        </div>
      )}
    </PatientLayout>
  );
};

export default MyBilans;
