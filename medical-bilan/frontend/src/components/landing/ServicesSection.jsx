import { useTranslation } from 'react-i18next';
import { MessageSquare, Phone, Mail } from 'lucide-react';

const icons = [MessageSquare, Phone, Mail];

const ServicesSection = () => {
  const { t } = useTranslation();
  const items = t('landing.services.items', { returnObjects: true });

  return (
    <section id="services" className="py-32 px-6 bg-paper border-t border-ink/5">
      <div className="max-w-7xl mx-auto">
        <h2
          className="font-serif text-4xl md:text-6xl text-ink text-center"
          style={{ lineHeight: 1, letterSpacing: '-1.5px' }}
        >
          {t('landing.services.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div
                key={i}
                className="p-8 rounded-3xl border border-ink/10 hover:border-ink/30 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center mb-6">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl text-ink mb-3">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
