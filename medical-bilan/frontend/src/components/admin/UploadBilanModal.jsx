import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useUploadBilan } from '../../hooks/queries/useBilans';

const inputCls = 'w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-ink transition bg-paper';

const UploadBilanModal = ({ open, onClose, patientId, patientName }) => {
  const upload = useUploadBilan();
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast.error('Seuls les fichiers PDF sont acceptés');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 20 MB)');
      return;
    }
    setFile(f);
  };

  const onSubmit = async (values) => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }
    try {
      await upload.mutateAsync({
        patientId,
        title: values.title,
        description: values.description,
        file,
      });
      toast.success('Bilan uploadé avec succès');
      reset();
      setFile(null);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur upload');
    }
  };

  const close = () => {
    reset();
    setFile(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="Nouveau bilan" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-muted">
          Pour le patient <strong className="text-ink">{patientName}</strong>
        </p>

        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-2">Titre du bilan *</label>
          <input
            type="text"
            autoFocus
            placeholder="Ex: Analyse de sang - Janvier 2026"
            className={inputCls}
            {...register('title', { required: 'Titre requis', minLength: { value: 2 } })}
          />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-2">Description (optionnelle)</label>
          <textarea
            rows={3}
            placeholder="Notes ou commentaires..."
            className={inputCls + ' resize-none'}
            {...register('description')}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-2">Fichier PDF *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-ink/5 border border-ink/10">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-ink" />
                <div>
                  <p className="text-sm text-ink truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-muted">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button type="button" onClick={() => setFile(null)} className="p-1 rounded hover:bg-ink/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-6 rounded-xl border-2 border-dashed border-ink/20 hover:border-ink/40 transition flex flex-col items-center gap-2 text-muted hover:text-ink"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm">Cliquez pour sélectionner un PDF</span>
              <span className="text-xs">Max 20 MB</span>
            </button>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={close}>Annuler</Button>
          <Button type="submit" disabled={upload.isPending || !file}>
            {upload.isPending ? 'Upload...' : 'Uploader'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadBilanModal;
