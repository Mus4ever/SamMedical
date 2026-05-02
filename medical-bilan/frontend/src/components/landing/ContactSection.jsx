import { useTranslation } from 'react-i18next';
import Button from '../common/Button';

const ContactSection = () => {
  const { t } = useTranslation();
  return (
    <section id="contact" className="py-32 px-6 bg-paper border-t border-ink/5">
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="font-serif text-4xl md:text-6xl text-ink"
          style={{ lineHeight: 1, letterSpacing: '-1.5px' }}
        >
          {t('landing.contact.title')}
        </h2>
        <p className="text-base sm:text-lg text-muted mt-6 leading-relaxed">
          {t('landing.contact.body')}
        </p>
        <Button as="a" href="mailto:contact@clinique.dz" size="xl" className="mt-10">
          {t('landing.contact.cta')}
        </Button>
      </div>
    </section>
  );
};

export default ContactSection;
