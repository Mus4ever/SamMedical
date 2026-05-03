import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { useGsapReveal } from '../../hooks/useGsap';

const ContactSection = () => {
  const { t } = useTranslation();
  const ref = useGsapReveal({ stagger: 0.1 });
  const items = [
    { icon: Mail,   label: 'Email',     value: 'contact@clinique.dz', href: 'mailto:contact@clinique.dz' },
    { icon: Phone,  label: 'Téléphone', value: '+213 XXX XXX XXX',    href: 'tel:+213000000000' },
    { icon: MapPin, label: 'Adresse',   value: 'Alger, Algérie',      href: '#' },
  ];

  return (
    <section id="contact" className="py-24 lg:py-32 px-6 lg:px-8 bg-paper">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="eyebrow text-mint-600">{t('landing.contact.eyebrow')}</p>
          <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-ink mt-3">
            {t('landing.contact.title')} <span className="display-italic text-muted">{t('landing.contact.titleEm')}</span>
          </h2>
          <p className="text-muted mt-4 text-base">{t('landing.contact.body')}</p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} className="glass rounded-2xl p-6 lift group flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-mint-100 text-mint-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="eyebrow text-muted">{label}</p>
                <p className="text-ink font-medium mt-1 break-all">{value}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-ink/30 group-hover:text-ink transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
