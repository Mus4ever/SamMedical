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

/**
 * Create or edit a patient.
 * - When `patient` is provided → edit mode (no password field).
 * - Otherwise → create mode (password optional, server generates one if blank).
 */
const PatientForm = ({ open, onClose, patient = null }) => {
  const isEdit = !!patient;
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const [revealedPassword, setRevealedPassword] = useState(null);
  const [revealedName, setRevealedName] = useState('');

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
          setRevealedName(res.patient.full_name);
          setRevealedPassword(res.generatedPassword);
          // Don't close yet — let the password modal show first
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
              💡 Aucun mot de passe à saisir — le système en générera un automatiquement
              et vous l'affichera après la création.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? '...' : (isEdit ? 'Enregistrer' : 'Créer')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Show generated password after successful creation */}
      <PasswordRevealModal
        open={!!revealedPassword}
        onClose={() => { setRevealedPassword(null); onClose(); }}
        password={revealedPassword}
        patientName={revealedName}
      />
    </>
  );
};

export default PatientForm;
