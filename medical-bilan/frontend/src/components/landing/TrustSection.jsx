import { useTranslation } from 'react-i18next';
import { Lock, Shield, FileSearch, KeyRound } from 'lucide-react';
import { useGsap, gsap } from '../../hooks/useGsap';

const iconMap = { Lock, Shield, FileSearch, KeyRound };

const TrustSection = () => {
  const { t } = useTranslation();
  const pillars = t('landing.trust.pillars', { returnObjects: true });

  const scope = useGsap((node) => {
    if (!node) return;
    gsap.from(node.querySelectorAll('[data-stagger]'), {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: node, start: 'top 75%' },
    });
  }, []);

  return (
    <section ref={scope} id="trust" className="relative py-24 lg:py-32 px-6 lg:px-8 bg-cream overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-mint-100 blob opacity-50" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-100 blob opacity-40" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p data-stagger className="text-xs uppercase tracking-[0.2em] text-mint-600 font-semibold mb-4">
            ◍ {t('landing.trust.eyebrow')}
          </p>
          <h2 data-stagger className="fraunces-display text-4xl sm:text-5xl lg:text-6xl text-ink" style={{ lineHeight: 1 }}>
            {t('landing.trust.title')}{' '}
            <em className="fraunces-display-italic text-muted">{t('landing.trust.titleEm')}</em>
          </h2>
          <p data-stagger className="text-muted mt-5 text-base lg:text-lg leading-relaxed">
            {t('landing.trust.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, i) => {
            const Icon = iconMap[p.icon];
            return (
              <article
                key={i}
                data-stagger
                className="glass rounded-3xl p-6 lift relative overflow-hidden group"
              >
                {/* Number watermark */}
                <span className="absolute top-3 right-4 fraunces-display text-2xl text-ink/8 tabular">0{i + 1}</span>

                <div className="w-11 h-11 rounded-2xl bg-ink text-paper flex items-center justify-center group-hover:bg-mint-500 transition-colors">
                  {Icon && <Icon className="w-4 h-4" strokeWidth={2.2} />}
                </div>
                <h3 className="fraunces-display text-xl text-ink mt-5 leading-tight">{p.title}</h3>
                <p className="text-sm text-muted mt-3 leading-relaxed">{p.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
