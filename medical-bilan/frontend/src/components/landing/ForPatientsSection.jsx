import { useTranslation } from 'react-i18next';
import { Bell, Lock, Smartphone } from 'lucide-react';
import { useGsap, gsap } from '../../hooks/useGsap';

const iconMap = { Bell, Lock, Smartphone };

const ForPatientsSection = () => {
  const { t } = useTranslation();
  const features = t('landing.patient.features', { returnObjects: true });

  const scope = useGsap((node) => {
    if (!node) return;
    gsap.from(node.querySelectorAll('[data-stagger]'), {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: { trigger: node, start: 'top 75%' },
    });
  }, []);

  return (
    <section ref={scope} id="patients" className="relative py-24 lg:py-32 px-6 lg:px-8 bg-paper overflow-hidden">
      {/* Decorative curve */}
      <svg className="absolute -top-1/2 -right-1/2 w-full h-full opacity-[0.04]" viewBox="0 0 800 800" fill="none">
        <circle cx="400" cy="400" r="380" stroke="#16A34A" strokeWidth="2" />
        <circle cx="400" cy="400" r="280" stroke="#16A34A" strokeWidth="2" />
        <circle cx="400" cy="400" r="180" stroke="#16A34A" strokeWidth="2" />
      </svg>

      <div className="relative max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16" data-stagger>
          <p className="text-xs uppercase tracking-[0.2em] text-mint-600 font-semibold mb-4">
            ◍ {t('landing.patient.eyebrow')}
          </p>
          <h2 className="fraunces-display text-4xl sm:text-5xl lg:text-6xl text-ink" style={{ lineHeight: 1 }}>
            {t('landing.patient.title')}{' '}
            <em className="fraunces-display-italic text-muted">{t('landing.patient.titleEm')}</em>
          </h2>
          <p className="text-muted mt-5 text-base lg:text-lg leading-relaxed max-w-2xl">
            {t('landing.patient.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = iconMap[f.icon];
            const accents = ['mint', 'sky', 'peach'];
            const a = accents[i];
            return (
              <article
                key={i}
                data-stagger
                className={`relative rounded-3xl p-8 border lift transition-all overflow-hidden ${
                  a === 'mint' ? 'bg-mint-50 border-mint-200' :
                  a === 'sky'  ? 'bg-sky-50 border-sky-200' :
                                 'bg-peach-50 border-peach-200'
                }`}
              >
                {/* Number badge */}
                <span className={`absolute top-6 right-6 fraunces-display text-5xl ${
                  a === 'mint' ? 'text-mint-200' :
                  a === 'sky'  ? 'text-sky-200' :
                                 'text-peach-200'
                }`}>
                  0{i + 1}
                </span>

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  a === 'mint' ? 'bg-mint-200 text-mint-700' :
                  a === 'sky'  ? 'bg-sky-200 text-sky-600' :
                                 'bg-peach-200 text-peach-400'
                }`}>
                  {Icon && <Icon className="w-5 h-5" strokeWidth={2.2} />}
                </div>

                <h3 className="fraunces-display text-2xl text-ink mt-6 leading-tight">{f.title}</h3>
                <p className="text-sm text-muted mt-3 leading-relaxed">{f.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ForPatientsSection;
