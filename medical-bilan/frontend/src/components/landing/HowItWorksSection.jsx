import { useTranslation } from 'react-i18next';
import { Upload, Bell, FileCheck2 } from 'lucide-react';
import { useGsapReveal } from '../../hooks/useGsap';

const stepIcons = [Upload, Bell, FileCheck2];
const stepColors = [
  'bg-mint-100 text-mint-700 border-mint-200',
  'bg-sky-100 text-sky-600 border-sky-200',
  'bg-amber-100 text-amber-500 border-amber-200',
];

const HowItWorksSection = () => {
  const { t } = useTranslation();
  const headerRef = useGsapReveal();
  const stepsRef = useGsapReveal({ stagger: 0.15 });
  const steps = t('landing.how.steps', { returnObjects: true });

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-8 bg-cream relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-mint-100 blob opacity-50" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-100 blob opacity-40" />

      <div className="relative max-w-7xl mx-auto">
        <div ref={headerRef} className="text-center mb-16 max-w-2xl mx-auto">
          <p className="eyebrow text-mint-600">{t('landing.how.eyebrow')}</p>
          <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-ink mt-3">
            {t('landing.how.title')} <span className="display-italic text-muted">{t('landing.how.titleEm')}</span>
          </h2>
          <p className="text-muted mt-4 text-base">{t('landing.how.subtitle')}</p>
        </div>

        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-14 left-full w-full h-px bg-gradient-to-r from-ink/15 to-transparent z-0 -translate-x-1/2 ml-6" />
                )}
                <div className="relative glass rounded-3xl p-8 shadow-soft lift h-full">
                  <p className="display text-7xl text-ink/10">{step.n}</p>
                  <div className={`w-12 h-12 rounded-2xl ${stepColors[i]} border flex items-center justify-center mt-6`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="display text-2xl text-ink mt-6 leading-tight">{step.title}</h3>
                  <p className="text-muted text-sm mt-3 leading-relaxed">{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
