import { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';

/**
 * Shows a freshly generated password to the admin one time.
 * The admin should copy it and communicate it to the patient.
 */
const PasswordRevealModal = ({ open, onClose, password, patientName }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success('Mot de passe copié');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Mot de passe généré" size="md">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Voici le mot de passe pour <strong className="text-ink">{patientName}</strong>.
          Communiquez-le au patient — il ne sera plus affiché ensuite.
        </p>

        <div className="flex items-center gap-2 p-4 rounded-xl bg-ink/5 border border-ink/10">
          <code className="flex-1 font-mono text-lg text-ink select-all">{password}</code>
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-lg hover:bg-ink/10 transition"
            title="Copier"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900">
            Ce mot de passe ne sera plus visible. Notez-le ou copiez-le maintenant.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose}>J'ai noté</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PasswordRevealModal;
