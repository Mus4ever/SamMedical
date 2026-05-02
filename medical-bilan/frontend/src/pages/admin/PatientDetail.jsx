import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Phone, Mail, Calendar, Send, Trash2, Download, Edit, Key } from 'lucide-react';
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
  const [revealedPassword, setRevealedPassword] = useState(null);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      </AdminLayout>
    );
  }

  if (!patient) {
    return (
      <AdminLayout>
        <p className="text-center text-muted py-20">Patient introuvable.</p>
      </AdminLayout>
    );
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
    } catch (err) {
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
    if (!confirm(`Réinitialiser le mot de passe de ${patient.full_name} ?`)) return;
    try {
      const res = await resetPwd.mutateAsync({ id: patient.id });
      if (res.generatedPassword) {
        setRevealedPassword(res.generatedPassword);
      }
    } catch {
      toast.error('Erreur réinitialisation');
    }
  };

  return (
    <AdminLayout>
      <Link to="/admin/patients" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Retour aux patients
      </Link>

      {/* Patient info card */}
      <div className="rounded-2xl border border-ink/10 bg-paper p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-ink" style={{ letterSpacing: '-0.5px' }}>
              {patient.full_name}
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-muted">
              <span className="inline-flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{patient.phone}</span>
              {patient.email && <span className="inline-flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{patient.email}</span>}
              <span className="inline-flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />Inscrit le {formatDate(patient.created_at)}</span>
            </div>
            {!patient.is_active && (
              <span className="mt-3 inline-block text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">Désactivé</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
              <Edit className="w-3.5 h-3.5 mr-2" />Modifier
            </Button>
            <Button variant="secondary" size="sm" onClick={handleResetPassword}>
              <Key className="w-3.5 h-3.5 mr-2" />Reset mot de passe
            </Button>
          </div>
        </div>
      </div>

      {/* Bilans section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-ink">Bilans ({patient.bilans?.length || 0})</h2>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="w-4 h-4 mr-2" />Nouveau bilan
        </Button>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-paper overflow-hidden">
        {patient.bilans?.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted">Aucun bilan pour ce patient.</p>
            <Button variant="secondary" onClick={() => setShowUpload(true)} className="mt-4">
              Uploader le premier bilan
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-ink/5">
            {patient.bilans?.map((b) => (
              <li key={b.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
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
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleDownload(b.id)} title="Télécharger" className="p-2 rounded-lg hover:bg-ink/5 transition">
                      <Download className="w-4 h-4" />
                    </button>
                    {b.status === 'pending' && (
                      <button onClick={() => handleMarkReady(b.id)} title="Marquer prêt + notifier" className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700 transition">
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(b.id)} title="Supprimer" className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <UploadBilanModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        patientId={patient.id}
        patientName={patient.full_name}
      />
      <PatientForm
        open={showEdit}
        onClose={() => setShowEdit(false)}
        patient={patient}
      />
      <PasswordRevealModal
        open={!!revealedPassword}
        onClose={() => setRevealedPassword(null)}
        password={revealedPassword}
        patientName={patient.full_name}
      />
    </AdminLayout>
  );
};

export default PatientDetail;
