import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const Login = () => {
  const { t } = useTranslation();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, bounce
  if (user) {
    return null;
  }

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
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Top bar */}
      <header className="absolute top-0 inset-x-0 px-8 py-6 flex items-center justify-between z-10">
        <Logo />
        <LanguageSwitcher />
      </header>

      {/* Centered form */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm animate-fade-rise">
          <h1 className="font-serif text-5xl text-ink text-center" style={{ letterSpacing: '-1px', lineHeight: 1 }}>
            {t('auth.login.title')}
          </h1>
          <p className="text-center text-muted text-sm mt-3 mb-10">
            {t('auth.login.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2">
                {t('auth.login.phone')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0770000000"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-ink transition bg-paper text-ink"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2">
                {t('auth.login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-ink/15 focus:outline-none focus:border-ink transition bg-paper text-ink"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-ink transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                t('auth.login.submitting')
              ) : (
                <>
                  {t('auth.login.submit')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted mt-10">
            <Link to="/" className="hover:text-ink transition">← Retour à l'accueil</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
