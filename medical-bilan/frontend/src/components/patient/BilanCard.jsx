import { useState } from 'react';
import { FileText, Download, Eye, Calendar, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/formatDate';
import BilanViewerModal from '../common/BilanViewerModal';

const BilanCard = ({ bilan }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const isNew = bilan.status === 'ready';

  return (
    <>
      <article
        className={cn(
          'group relative rounded-3xl border lift transition-all',
          isNew ? 'glass-mint border-mint-200 shadow-soft' : 'glass border-ink/5 shadow-soft'
        )}
      >
        {isNew && (
          <div className="absolute -top-3 -right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-500 text-paper text-[10px] font-medium uppercase tracking-wider shadow-glow-mint">
            <Sparkles className="w-3 h-3" />
            Nouveau
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
              isNew ? 'bg-mint-500 text-paper' : 'bg-ink/5 text-ink'
            )}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="display text-2xl text-ink leading-tight">{bilan.title}</h3>
              {bilan.description && <p className="text-sm text-muted mt-2 line-clamp-2 leading-relaxed">{bilan.description}</p>}
              <div className="flex items-center gap-3 text-xs text-muted mt-3">
                <span className="inline-flex items-center gap-1.5"><Calendar className="w-3 h-3" />{formatDate(bilan.created_at)}</span>
                {!isNew && <span className="inline-flex items-center gap-1.5 text-sky-600"><Eye className="w-3 h-3" /> Consulté</span>}
              </div>
            </div>
          </div>

          <button
            onClick={() => setViewerOpen(true)}
            className={cn(
              'mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-medium transition-all',
              isNew
                ? 'bg-ink text-paper hover:scale-[1.02] shadow-soft-lg'
                : 'bg-paper text-ink border border-ink/15 hover:border-ink hover:bg-ink hover:text-paper'
            )}
          >
            <Download className="w-4 h-4" />
            {isNew ? 'Consulter mes résultats' : 'Ouvrir le document'}
          </button>
        </div>
      </article>

      <BilanViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        bilanId={bilan.id}
        bilanTitle={bilan.title}
        fileName={bilan.file_name}
      />
    </>
  );
};

export default BilanCard;
