import { useState, useEffect } from 'react';
import { Download, X as XIcon, ExternalLink, FileText, Loader } from 'lucide-react';
import { useDownloadBilan } from '../../hooks/queries/useBilans';
import LoadingSpinner from './LoadingSpinner';

/**
 * Inline PDF viewer modal — uses an iframe with the signed Supabase URL.
 *
 * Props:
 *   - open, onClose
 *   - bilanId, bilanTitle
 */
const BilanViewerModal = ({ open, onClose, bilanId, bilanTitle, fileName }) => {
  const download = useDownloadBilan();
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !bilanId) {
      setUrl(null);
      setLoading(true);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    download.mutateAsync(bilanId)
      .then((data) => {
        if (cancelled) return;
        setUrl(data.url);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Erreur de chargement');
        setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bilanId]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-paper sm:rounded-3xl shadow-soft-xl w-full sm:max-w-5xl flex flex-col z-10 sm:max-h-[90vh] h-full sm:h-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-ink/5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-mint-100 text-mint-700 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink truncate">{bilanTitle || 'Bilan'}</p>
            {fileName && <p className="text-xs text-muted truncate mono">{fileName}</p>}
          </div>
          <div className="flex items-center gap-1">
            {url && (
              <>
                <a
                  href={url}
                  download={fileName || 'bilan.pdf'}
                  className="p-2 rounded-xl hover:bg-ink/5 text-ink transition"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                </a>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl hover:bg-ink/5 text-ink transition"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-ink/5 transition"
              aria-label="Fermer"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-ink/5 min-h-[60vh] sm:min-h-[70vh]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-muted">
              <Loader className="w-6 h-6 animate-spin" />
              <p className="text-sm">Chargement du document...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-red-600 p-6 text-center">
              <p className="text-sm">{error}</p>
              <p className="text-xs text-muted">Essayez de fermer et de rouvrir.</p>
            </div>
          ) : url ? (
            <iframe
              src={`${url}#toolbar=1&navpanes=0`}
              title={bilanTitle}
              className="w-full h-full"
              style={{ border: 0, minHeight: 'inherit' }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BilanViewerModal;
