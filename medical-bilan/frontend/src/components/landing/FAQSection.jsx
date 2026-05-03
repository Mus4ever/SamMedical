import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Minus } from 'lucide-react';
import { useGsapReveal } from '../../hooks/useGsap';
import { cn } from '../../utils/cn';

const FaqSection = () => {
  const { t } = useTranslation();
  const ref = useGsapReveal();
  const items = t('landing.faq.items', { returnObjects: true });
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="faq" className="py-24 lg:py-32 px-6 lg:px-8 bg-cream relative overflow-hidden">
      <div className="absolute -top-40 right-0 w-96 h-96 bg-mint-100 blob opacity-50" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-100 blob opacity-40" />

      <div ref={ref} className="relative max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="eyebrow text-mint-600">{t('landing.faq.eyebrow')}</p>
          <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-ink mt-3">
            {t('landing.faq.title')} <span className="display-italic text-muted">{t('landing.faq.titleEm')}</span>
          </h2>
          <p className="text-muted mt-4 text-base">{t('landing.faq.subtitle')}</p>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className={cn('rounded-2xl border overflow-hidden transition-all',
                  isOpen ? 'glass border-mint-200 shadow-soft' : 'bg-paper/80 border-ink/5 hover:border-ink/15'
                )}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-ink font-medium pr-2">{item.q}</span>
                  <span className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    isOpen ? 'bg-mint-500 text-paper' : 'bg-ink/5 text-ink'
                  )}>
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>
                <div className={cn('grid transition-all duration-500 ease-out', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm text-muted leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
