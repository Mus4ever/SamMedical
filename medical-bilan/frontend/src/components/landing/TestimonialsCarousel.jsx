import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGsapReveal } from '../../hooks/useGsap';
import { cn } from '../../utils/cn';

const TestimonialsCarousel = () => {
  const { t } = useTranslation();
  const ref = useGsapReveal();
  const items = t('landing.testimonials.items', { returnObjects: true });
  const [idx, setIdx] = useState(0);
  const current = items[idx];

  const initials = current.author.split(' ').map(w => w[0]).join('').slice(0, 2);
  const colors = ['from-mint-300 to-mint-500', 'from-sky-300 to-sky-500', 'from-amber-200 to-amber-400'];

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-8 bg-paper relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 bg-mint-100 blob opacity-40" />

      <div ref={ref} className="relative max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="eyebrow text-mint-600">{t('landing.testimonials.eyebrow')}</p>
          <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-ink mt-3">
            {t('landing.testimonials.title')} <span className="display-italic text-muted">{t('landing.testimonials.titleEm')}</span>
          </h2>
        </div>

        <div className="glass rounded-3xl p-10 lg:p-14 shadow-soft-lg relative">
          <Quote className="w-10 h-10 text-mint-400 mb-6 mx-auto" />

          <blockquote className="display text-2xl sm:text-3xl lg:text-4xl text-ink leading-tight text-center min-h-[140px]">
            "{current.quote}"
          </blockquote>

          <div className="flex items-center justify-center gap-1 mt-8">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center text-paper font-medium shadow-soft`}>
              {initials}
            </div>
            <div className="text-left">
              <p className="font-medium text-ink text-sm">{current.author}</p>
              <p className="text-xs text-muted">{current.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setIdx((idx - 1 + items.length) % items.length)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/80 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn('h-2 rounded-full transition-all',
                  idx === i ? 'w-8 bg-ink' : 'w-2 bg-ink/20'
                )}
              />
            ))}
          </div>
          <button
            onClick={() => setIdx((idx + 1) % items.length)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/80 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
