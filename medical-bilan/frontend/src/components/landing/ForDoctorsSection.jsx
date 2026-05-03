import { useTranslation } from 'react-i18next';
import { Check, ArrowRight, LayoutDashboard, Users, FileText } from 'lucide-react';
import { useGsapReveal } from '../../hooks/useGsap';

const ForDoctorsSection = () => {
  const { t } = useTranslation();
  const ref = useGsapReveal();
  const features = t('landing.doctors.features', { returnObjects: true });

  return (
    <section ref={ref} className="py-24 lg:py-32 px-6 lg:px-8 mesh-dark text-paper relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="eyebrow text-mint-300">{t('landing.doctors.eyebrow')}</p>
          <h2 className="display text-4xl sm:text-5xl lg:text-6xl mt-3">
            {t('landing.doctors.title')} <span className="display-italic text-mint-300">{t('landing.doctors.titleEm')}</span>
          </h2>
          <p className="text-paper/70 text-base mt-6 leading-relaxed max-w-lg">{t('landing.doctors.body')}</p>

          <ul className="mt-8 space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-paper/85">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-mint-500 text-ink flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3" />
                </span>
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <a href="#contact" className="inline-flex items-center gap-2 mt-10 px-8 py-4 bg-mint-500 text-ink rounded-full font-medium hover:bg-mint-400 transition shadow-glow-mint">
            {t('landing.doctors.cta')}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="relative">
          <div className="glass-dark rounded-3xl p-6 shadow-soft-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-mint-400/80" />
              <span className="ml-3 text-xs text-paper/50 mono">clinique.dz/admin</span>
            </div>

            <div className="bg-paper rounded-2xl p-6 text-ink">
              <p className="display text-2xl">Tableau de bord</p>
              <p className="text-xs text-muted mt-1">Aperçu de l'activité</p>

              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { label: 'Patients',   value: '527',  bg: 'bg-mint-50',  border: 'border-mint-100' },
                  { label: 'Bilans',     value: '1.2k', bg: 'bg-sky-50',   border: 'border-sky-100' },
                  { label: 'En attente', value: '12',   bg: 'bg-amber-50', border: 'border-amber-100' },
                ].map((s) => (
                  <div key={s.label} className={`p-3 rounded-xl ${s.bg} border ${s.border}`}>
                    <p className="text-[10px] eyebrow text-muted">{s.label}</p>
                    <p className="display text-2xl mt-1 mono">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                {[LayoutDashboard, Users, FileText].map((Icon, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink/5 transition">
                    <Icon className="w-4 h-4 text-muted" />
                    <div className="flex-1 h-2 bg-ink/5 rounded-full overflow-hidden">
                      <div className="h-full bg-mint-300 rounded-full" style={{ width: `${30 + i * 25}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute -top-4 -right-4 glass-mint rounded-full px-4 py-2 shadow-soft animate-float">
            <span className="text-xs font-medium text-mint-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForDoctorsSection;
