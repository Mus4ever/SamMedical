import { useState } from 'react';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/formatDate';
import { useDownloadBilan } from '../../hooks/queries/useBilans';

const BilanCard = ({ bilan }) => {
  const download = useDownloadBilan();
  const [busy, setBusy] = useState(false);

  const isViewed = bilan.status === 'viewed';

  const handleOpen = async () => {
    setBusy(true);
    try {
      const { url } = await download.mutateAsync(bilan.id);
      window.open(url, '_blank');
    } catch {
      toast.error('Impossible d\'ouvrir le document');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      className={cn(
        'group rounded-2xl border bg-paper transition-all',
        'hover:border-ink/30 hover:shadow-sm',
        isViewed ? 'border-ink/10' : 'border-emerald-200 bg-emerald-50/30'
      )}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
            isViewed ? 'bg-ink/5 text-ink' : 'bg-emerald-100 text-emerald-700'
          )}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-xl text-ink leading-tight">
              {bilan.title}
            </h3>
            {bilan.description && (
              <p className="text-sm text-muted mt-2 line-clamp-2">{bilan.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted mt-3">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {formatDate(bilan.created_at)}
              </span>
              {!isViewed && (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                  Nouveau
                </span>
              )}
              {isViewed && (
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="w-3 h-3" /> Consulté
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={handleOpen} disabled={busy} size="md">
            <Download className="w-4 h-4 mr-2" />
            {busy ? 'Ouverture…' : 'Ouvrir / Télécharger'}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default BilanCard;
