import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useGsapReveal } from '../../hooks/useGsap';

const CtaSection = () => {
  const { t } = useTranslation();
  const ref = useGsapReveal();

  return (
    <section ref={ref} className="py-24 lg:py-32 px-6 lg:px-8 bg-paper">
      <div className="max-w-6xl mx-auto">
        <div className="relative mesh-mint rounded-[3rem] p-12 lg:p-20 text-center overflow-hidden border border-mint-200 shadow-soft-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-mint-200 blob opacity-60" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-100 blob opacity-50" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-mint-700 font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Démarrage rapide
            </div>
            <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-ink">{t('landing.finalCta.title')}</h2>
            <p className="text-muted mt-6 text-base max-w-xl mx-auto">{t('landing.finalCta.body')}</p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 bg-ink text-paper font-medium shadow-soft-lg hover:scale-[1.03] transition-all">
                {t('landing.finalCta.primary')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 glass text-ink font-medium hover:bg-white/80 transition-all">
                {t('landing.finalCta.secondary')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
