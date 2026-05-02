import { useTranslation } from 'react-i18next';

const AboutSection = () => {
  const { t } = useTranslation();
  return (
    <section id="about" className="py-32 px-6 bg-paper">
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="font-serif text-4xl md:text-6xl text-ink"
          style={{ lineHeight: 1, letterSpacing: '-1.5px' }}
        >
          {t('landing.about.title')}
        </h2>
        <p className="text-base sm:text-lg text-muted mt-8 max-w-2xl mx-auto leading-relaxed">
          {t('landing.about.body')}
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
