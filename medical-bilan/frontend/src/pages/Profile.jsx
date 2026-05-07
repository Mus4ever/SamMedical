import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Shield, Eye, EyeOff, Key, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../layouts/AdminLayout';
import PatientLayout from '../layouts/PatientLayout';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useChangePassword } from '../hooks/queries/useAuth';

const inputCls = 'w-full px-4 py-3 rounded-2xl border border-ink/10 bg-white/70 focus:outline-none focus:border-mint-400 focus:bg-white transition text-ink';

const Profile = () => {
  const { user, logout } = useAuth();
  const changePwd = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const onSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await changePwd.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Mot de passe modifié — reconnexion requise');
      reset();
      setTimeout(() => logout(), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const isAdmin = user?.role === 'admin';
  const Layout = isAdmin ? AdminLayout : PatientLayout;
  const backHref = isAdmin ? '/admin/dashboard' : '/patient/bilans';

  return (
    <Layout>
      <Link to={backHref} className="inline-flex items-center gap-2 text-sm text-muted hover:text-mint-600 mb-6 transition group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Retour
      </Link>

      {/* Header */}
      <div className="mb-10 animate-fade-rise">
        <div className="inline-flex items-center gap-2 glass-mint rounded-full px-3 py-1 text-xs text-mint-700 font-medium mb-4">
          <Sparkles className="w-3 h-3" />
          Mon compte
        </div>
        <h1 className="display text-5xl text-ink">Profil</h1>
        <p className="text-muted text-sm mt-3">Vos informations personnelles et la sécurité de votre compte.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-rise-delay">
        {/* User info card */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-8 shadow-soft text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-mint-200 to-mint-500 flex items-center justify-center text-paper text-4xl display mx-auto mb-4 shadow-soft-lg">
              {user?.fullName?.charAt(0).toUpperCase() || '?'}
            </div>
            <h2 className="display text-2xl text-ink">{user?.fullName}</h2>
            <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-medium ${isAdmin ? 'bg-sky-100 text-sky-600 border border-sky-200' : 'bg-mint-100 text-mint-700 border border-mint-200'}`}>
              {isAdmin ? 'Administrateur' : 'Patient'}
            </span>

            <div className="mt-6 pt-6 border-t border-ink/5 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="text-ink mono">{user?.phone}</span>
              </div>
              {user?.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted flex-shrink-0" />
                  <span className="text-ink truncate">{user.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="text-mint-700">Compte sécurisé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change password form */}
        <div className="lg:col-span-2">
          <div className="glass rounded-3xl p-8 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="display text-xl text-ink">Changer le mot de passe</h3>
                <p className="text-xs text-muted mt-0.5">Vous serez déconnecté(e) après le changement.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block eyebrow text-muted mb-2">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    className={inputCls + ' pr-12'}
                    {...register('currentPassword', { required: 'Mot de passe requis' })}
                  />
                  <button type="button" onClick={() => setShowCurrent(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-ink transition" tabIndex={-1}>
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-xs text-red-600 mt-1">{errors.currentPassword.message}</p>}
              </div>

              <div>
                <label className="block eyebrow text-muted mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    className={inputCls + ' pr-12'}
                    {...register('newPassword', { required: 'Nouveau mot de passe requis', minLength: { value: 8, message: 'Minimum 8 caractères' } })}
                  />
                  <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-ink transition" tabIndex={-1}>
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block eyebrow text-muted mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type={showNew ? 'text' : 'password'}
                  className={inputCls}
                  {...register('confirmPassword', {
                    required: 'Confirmation requise',
                    validate: (val) => val === watch('newPassword') || 'Les mots de passe ne correspondent pas',
                  })}
                />
                {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={changePwd.isPending}>
                  <Key className="w-3.5 h-3.5 mr-2" />
                  {changePwd.isPending ? 'Modification...' : 'Modifier le mot de passe'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
