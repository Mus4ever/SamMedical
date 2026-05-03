import { useTranslation } from 'react-i18next';
import { useGsapReveal } from '../../hooks/useGsap';

const AboutSection = () => {
  const { t } = useTranslation();
  const ref = useGsapReveal();

  return (
    <section ref={ref} id="about" className="py-24 lg:py-32 px-6 lg:px-8 bg-paper">
      <div className="max-w-4xl mx-auto text-center">
        <p className="eyebrow text-mint-600">{t('landing.about.eyebrow')}</p>
        <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-ink mt-3">
          {t('landing.about.title')} <span className="display-italic text-muted">{t('landing.about.titleEm')}</span>
        </h2>
        <p className="text-base sm:text-lg text-muted mt-8 max-w-2xl mx-auto leading-relaxed">{t('landing.about.body')}</p>
      </div>
    </section>
  );
};

export default AboutSection;
