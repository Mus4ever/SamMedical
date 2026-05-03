import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Phone, Mail, Calendar, Send, Trash2, Download, Edit, Key, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BilanStatusBadge from '../../components/admin/BilanStatusBadge';
import UploadBilanModal from '../../components/admin/UploadBilanModal';
import PatientForm from '../../components/admin/PatientForm';
import PasswordRevealModal from '../../components/admin/PasswordRevealModal';
import { usePatient, useResetPatientPassword } from '../../hooks/queries/usePatients';
import { useMarkBilanReady, useDeleteBilan, useDownloadBilan } from '../../hooks/queries/useBilans';
import { formatDate, formatDateTime } from '../../utils/formatDate';

const PatientDetail = () => {
  const { id } = useParams();
  const { data: patient, isLoading } = usePatient(id);
  const markReady = useMarkBilanReady();
  const deleteBilan = useDeleteBilan();
  const download = useDownloadBilan();
  const resetPwd = useResetPatientPassword();

  const [showUpload, setShowUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [revealed, setRevealed] = useState(null);

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center py-20"><LoadingSpinner /></div></AdminLayout>;
  }
  if (!patient) {
    return <AdminLayout><p className="text-center text-muted py-20">Patient introuvable.</p></AdminLayout>;
  }

  const handleMarkReady = async (bilanId) => {
    try {
      await markReady.mutateAsync(bilanId);
      toast.success('Notifications en cours d\'envoi');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (bilanId) => {
    if (!confirm('Supprimer ce bilan ? Cette action est irréversible.')) return;
    try {
      await deleteBilan.mutateAsync(bilanId);
      toast.success('Bilan supprimé');
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const handleDownload = async (bilanId) => {
    try {
      const { url } = await download.mutateAsync(bilanId);
      window.open(url, '_blank');
    } catch {
      toast.error('Impossible de télécharger');
    }
  };

  const handleResetPassword = async () => {
    if (!confirm(`Réinitialiser le mot de passe de ${patient.full_name} ? Un nouveau sera envoyé par SMS et email.`)) return;
    try {
      const res = await resetPwd.mutateAsync({ id: patient.id });
      if (res.generatedPassword) {
        setRevealed({ password: res.generatedPassword, credentials: res.credentials });
      }
    } catch {
      toast.error('Erreur réinitialisation');
    }
  };

  return (
    <AdminLayout>
      <Link to="/admin/patients" className="inline-flex items-center gap-2 text-sm text-muted hover:text-mint-600 mb-6 transition group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Retour aux patients
      </Link>

      {/* Patient info — glass card with avatar */}
      <div className="glass rounded-3xl p-8 mb-8 shadow-soft animate-fade-rise">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Big avatar */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-mint-200 to-mint-400 flex items-center justify-center text-paper text-3xl font-serif shadow-soft flex-shrink-0">
              {patient.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-serif text-4xl text-ink" style={{ letterSpacing: '-0.5px' }}>{patient.full_name}</h1>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{patient.phone}</span>
                {patient.email && <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{patient.email}</span>}
                <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Inscrit le {formatDate(patient.created_at)}</span>
              </div>
              {!patient.is_active && (
                <span className="mt-3 inline-block text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">Désactivé</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
              <Edit className="w-3.5 h-3.5 mr-2" />Modifier
            </Button>
            <Button variant="secondary" size="sm" onClick={handleResetPassword}>
              <Key className="w-3.5 h-3.5 mr-2" />Reset + envoyer
            </Button>
          </div>
        </div>
      </div>

      {/* Bilans header */}
      <div className="flex items-center justify-between mb-4 animate-fade-rise-delay">
        <h2 className="font-serif text-3xl text-ink" style={{ letterSpacing: '-0.5px' }}>
          Bilans <span className="text-muted text-2xl">({patient.bilans?.length || 0})</span>
        </h2>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="w-4 h-4 mr-2" />Nouveau bilan
        </Button>
      </div>

      {/* Bilans list */}
      <div className="glass rounded-3xl shadow-soft overflow-hidden animate-fade-rise-delay-2">
        {patient.bilans?.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-mint-100 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-mint-600" />
            </div>
            <p className="text-muted mb-4">Aucun bilan pour ce patient.</p>
            <Button variant="mint" onClick={() => setShowUpload(true)}>
              <Plus className="w-4 h-4 mr-2" />Uploader le premier bilan
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-ink/5">
            {patient.bilans?.map((b) => (
              <li key={b.id} className="p-5 hover:bg-white/40 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-mint-100 text-mint-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-medium text-ink">{b.title}</h3>
                        <BilanStatusBadge status={b.status} />
                      </div>
                      {b.description && <p className="text-sm text-muted mt-1">{b.description}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted mt-2">
                        <span>Uploadé le {formatDateTime(b.created_at)}</span>
                        {b.notification_sent_at && <span>· Notifié le {formatDateTime(b.notification_sent_at)}</span>}
                        {b.file_size && <span>· {(b.file_size / 1024).toFixed(0)} KB</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(b.id)}
                      title="Télécharger"
                      className="p-2.5 rounded-xl hover:bg-sky-50 text-muted hover:text-sky-600 transition"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {b.status === 'pending' && (
                      <button
                        onClick={() => handleMarkReady(b.id)}
                        title="Marquer prêt + notifier"
                        className="p-2.5 rounded-xl hover:bg-mint-100 text-muted hover:text-mint-700 transition"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(b.id)}
                      title="Supprimer"
                      className="p-2.5 rounded-xl hover:bg-red-50 text-muted hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <UploadBilanModal open={showUpload} onClose={() => setShowUpload(false)} patientId={patient.id} patientName={patient.full_name} />
      <PatientForm open={showEdit} onClose={() => setShowEdit(false)} patient={patient} />
      <PasswordRevealModal
        open={!!revealed}
        onClose={() => setRevealed(null)}
        password={revealed?.password}
        patientName={patient.full_name}
        patientHasEmail={!!patient.email}
        credentials={revealed?.credentials}
      />
    </AdminLayout>
  );
};

export default PatientDetail;
