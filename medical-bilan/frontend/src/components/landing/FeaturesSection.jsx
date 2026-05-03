import { useTranslation } from 'react-i18next';
import { Zap, ShieldCheck, Smartphone, Globe, Lock, Headphones } from 'lucide-react';
import { useGsapReveal } from '../../hooks/useGsap';

const iconMap = { Zap, ShieldCheck, Smartphone, Globe, Lock, Headphones };
const accents = ['mint', 'sky', 'amber', 'peach', 'mint', 'sky'];
const accentMap = {
  mint:  'bg-mint-100 text-mint-700 border-mint-200',
  sky:   'bg-sky-100 text-sky-600 border-sky-200',
  amber: 'bg-amber-100 text-amber-500 border-amber-200',
  peach: 'bg-peach-100 text-peach-400 border-peach-200',
};

const FeaturesSection = () => {
  const { t } = useTranslation();
  const headerRef = useGsapReveal();
  const gridRef = useGsapReveal({ stagger: 0.08 });
  const items = t('landing.features.items', { returnObjects: true });

  return (
    <section id="features" className="py-24 lg:py-32 px-6 lg:px-8 bg-paper relative">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="relative max-w-7xl mx-auto">
        <div ref={headerRef} className="text-center mb-16 max-w-3xl mx-auto">
          <p className="eyebrow text-mint-600">{t('landing.features.eyebrow')}</p>
          <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-ink mt-3">
            {t('landing.features.title')} <span className="display-italic text-muted">{t('landing.features.titleEm')}</span>
          </h2>
          <p className="text-muted mt-4 text-base">{t('landing.features.subtitle')}</p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] || Zap;
            return (
              <div key={i} className="glass rounded-3xl p-7 lift group">
                <div className={`w-12 h-12 rounded-2xl ${accentMap[accents[i]]} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="display text-xl text-ink mt-5 leading-tight">{item.title}</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">{item.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
