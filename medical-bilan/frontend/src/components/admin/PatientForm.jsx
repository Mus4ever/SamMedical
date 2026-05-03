import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useCreatePatient, useUpdatePatient } from '../../hooks/queries/usePatients';
import PasswordRevealModal from './PasswordRevealModal';

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-xs uppercase tracking-wider text-muted mb-2">{label}</label>
    {children}
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

const inputCls = 'w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-ink transition bg-paper';

const PatientForm = ({ open, onClose, patient = null }) => {
  const isEdit = !!patient;
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const [revealed, setRevealed] = useState(null); // { password, name, hasEmail, credentials }

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      fullName: patient?.full_name || '',
      phone:    patient?.phone     || '',
      email:    patient?.email     || '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        fullName: patient?.full_name || '',
        phone:    patient?.phone     || '',
        email:    patient?.email     || '',
      });
    }
  }, [open, patient, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: patient.id, ...values });
        toast.success('Patient mis à jour');
        onClose();
      } else {
        const res = await create.mutateAsync(values);
        toast.success('Patient créé');
        if (res.generatedPassword) {
          setRevealed({
            password: res.generatedPassword,
            name: res.patient.full_name,
            hasEmail: !!res.patient.email,
            credentials: res.credentials,
          });
        } else {
          onClose();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title={isEdit ? 'Modifier le patient' : 'Nouveau patient'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Nom complet *" error={errors.fullName?.message}>
            <input
              type="text"
              autoFocus
              className={inputCls}
              {...register('fullName', { required: 'Nom requis', minLength: { value: 2, message: 'Min 2 caractères' } })}
            />
          </Field>

          <Field label="Téléphone *" error={errors.phone?.message}>
            <input
              type="tel"
              placeholder="0770000000"
              className={inputCls}
              {...register('phone', { required: 'Téléphone requis' })}
            />
          </Field>

          <Field label="Email (optionnel)" error={errors.email?.message}>
            <input
              type="email"
              className={inputCls}
              {...register('email')}
            />
          </Field>

          {!isEdit && (
            <div className="text-xs text-muted bg-ink/5 p-3 rounded-xl">
              💡 Le système génère un mot de passe et l'envoie automatiquement au patient
              par <strong>SMS</strong> (et <strong>email</strong> si renseigné).
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? '...' : (isEdit ? 'Enregistrer' : 'Créer + envoyer')}
            </Button>
          </div>
        </form>
      </Modal>

      <PasswordRevealModal
        open={!!revealed}
        onClose={() => { setRevealed(null); onClose(); }}
        password={revealed?.password}
        patientName={revealed?.name}
        patientHasEmail={revealed?.hasEmail}
        credentials={revealed?.credentials}
      />
    </>
  );
};

export default PatientForm;
