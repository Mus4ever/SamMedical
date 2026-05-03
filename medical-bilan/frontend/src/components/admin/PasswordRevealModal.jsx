import { useState } from 'react';
import { Copy, Check, AlertTriangle, MessageSquare, Mail, X as XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';

/**
 * Shows a freshly generated password to the admin.
 * Also shows whether the system auto-sent credentials via SMS + email.
 *
 * Props:
 *   - open, onClose
 *   - password (string)         — the plaintext password
 *   - patientName (string)
 *   - patientHasEmail (bool)    — for the email status row
 *   - credentials ({sms, email, errors, pending}) — result from sendCredentials
 */
const PasswordRevealModal = ({ open, onClose, password, patientName, patientHasEmail = false, credentials = null }) => {
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

  // Build status pills
  const smsErr   = credentials?.errors?.find(e => e.type === 'sms');
  const emailErr = credentials?.errors?.find(e => e.type === 'email');
  const pending  = credentials?.pending;

  const StatusRow = ({ icon: Icon, label, status, error }) => {
    let color = 'text-muted bg-ink/5 border-ink/10';
    let text = '—';
    if (pending)        { color = 'text-amber-700 bg-amber-50 border-amber-200'; text = 'En cours d\'envoi…'; }
    else if (error)     { color = 'text-red-700 bg-red-50 border-red-200';       text = 'Échec'; }
    else if (status)    { color = 'text-emerald-700 bg-emerald-50 border-emerald-200'; text = 'Envoyé ✓'; }
    return (
      <div className={`flex items-center justify-between p-3 rounded-xl border ${color}`}>
        <div className="flex items-center gap-2 text-sm">
          <Icon className="w-4 h-4" />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-xs">{text}</span>
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Identifiants générés" size="md">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Voici le mot de passe pour <strong className="text-ink">{patientName}</strong>.
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

        {/* Auto-send status */}
        {credentials && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted">Envoi automatique</p>
            <StatusRow icon={MessageSquare} label="SMS"   status={credentials.sms}   error={smsErr} />
            {patientHasEmail
              ? <StatusRow icon={Mail} label="Email" status={credentials.email} error={emailErr} />
              : (
                <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-ink/15 text-muted">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                  <span className="text-xs">Aucune adresse email</span>
                </div>
              )}
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900">
            Ce mot de passe ne sera plus visible. Notez-le par précaution.
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
