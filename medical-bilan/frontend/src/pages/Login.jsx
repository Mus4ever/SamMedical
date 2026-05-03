import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/common/Logo';

const Login = () => {
  const { t } = useTranslation();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(phone, password);
      toast.success(`Bienvenue, ${u.fullName.split(' ')[0]}`);
      const from = location.state?.from;
      const dest = from || (u.role === 'admin' ? '/admin/dashboard' : '/patient/bilans');
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden mesh-mint">
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-mint-200 blob animate-blob" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-sky-100 blob animate-blob" style={{ animationDelay: '4s' }} />
      <div className="absolute top-1/2 left-10 w-64 h-64 bg-amber-100 blob animate-blob" style={{ animationDelay: '8s' }} />

      <header className="relative z-10 px-6 lg:px-8 py-6 flex items-center justify-between">
        <Logo />
        <Link to="/" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          Accueil
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md animate-fade-rise">
          <div className="glass rounded-3xl p-8 sm:p-10 shadow-soft-xl">
            <h1 className="font-serif text-4xl sm:text-5xl text-ink text-center" style={{ letterSpacing: '-1px', lineHeight: 1 }}>
              {t('auth.login.title')}
            </h1>
            <p className="text-center text-muted text-sm mt-3 mb-8">
              {t('auth.login.subtitle')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('auth.login.phone')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0770000000"
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-2xl border border-ink/10 bg-white/70 focus:outline-none focus:border-mint-400 focus:bg-white transition text-ink"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('auth.login.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-ink/10 bg-white/70 focus:outline-none focus:border-mint-400 focus:bg-white transition text-ink"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-ink transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 bg-ink text-paper font-medium shadow-soft-lg hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? t('auth.login.submitting') : (
                  <>
                    {t('auth.login.submit')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-3 rounded-2xl bg-mint-50 border border-mint-200 text-xs text-mint-700 text-center">
              💡 Demo: <span className="font-mono">+213770000000</span> / <span className="font-mono">Admin@1234</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted mt-6">
            <Link to="/" className="hover:text-ink transition">← Retour à l'accueil</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
