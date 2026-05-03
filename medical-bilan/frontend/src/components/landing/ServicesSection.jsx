import { useTranslation } from 'react-i18next';
import { MessageSquare, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { useGsapReveal } from '../../hooks/useGsap';

const ServicesSection = () => {
  const { t } = useTranslation();
  const ref = useGsapReveal();
  const items = t('landing.services.items', { returnObjects: true });

  return (
    <section id="services" className="py-24 lg:py-32 px-6 lg:px-8 bg-paper">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <p className="eyebrow text-mint-600">{t('landing.services.eyebrow')}</p>
          <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-ink mt-3">
            {t('landing.services.title')} <span className="display-italic text-muted">{t('landing.services.titleEm')}</span>
          </h2>
          <p className="text-muted mt-4 text-base">{t('landing.services.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SMS — large */}
          <div className="lg:col-span-2 mesh-mint border border-mint-200 rounded-3xl p-10 lift relative overflow-hidden group">
            <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-mint-200 text-mint-700 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="eyebrow text-mint-700">Canal #1</p>
            <h3 className="display text-3xl lg:text-4xl text-ink mt-4 max-w-md leading-tight">{items[0].title}</h3>
            <p className="text-muted text-base mt-4 max-w-md leading-relaxed">{items[0].body}</p>
            <div className="mt-8 max-w-xs glass rounded-2xl p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted eyebrow mono">+213 770 ...</span>
                <span className="text-[10px] text-mint-600">Maintenant</span>
              </div>
              <p className="text-xs text-ink leading-relaxed">مرحبا. نتائج تحاليلكم جاهزة. ادخلوا للموقع للاطلاع. 🩺</p>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-sky-50 border border-sky-200 rounded-3xl p-8 lift relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <p className="eyebrow text-sky-600 mt-6">Canal #2</p>
            <h3 className="display text-2xl text-ink mt-3 leading-tight">{items[1].title}</h3>
            <p className="text-muted text-sm mt-3 leading-relaxed">{items[1].body}</p>
          </div>

          {/* Email — full width */}
          <div className="lg:col-span-3 bg-amber-50 border border-amber-200 rounded-3xl p-10 lift relative group">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="eyebrow text-amber-500">Canal #3</p>
                <h3 className="display text-2xl lg:text-3xl text-ink mt-2 leading-tight">{items[2].title}</h3>
                <p className="text-muted text-sm mt-2 leading-relaxed max-w-2xl">{items[2].body}</p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-ink/40 group-hover:text-ink transition-colors hidden lg:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
