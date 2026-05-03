import { useTranslation } from 'react-i18next';
import { Quote, Star } from 'lucide-react';
import { useGsap, gsap } from '../../hooks/useGsap';

const TestimonialSection = () => {
  const { t } = useTranslation();

  const scope = useGsap((node) => {
    if (!node) return;
    gsap.from(node.querySelectorAll('[data-stagger]'), {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: node, start: 'top 75%' },
    });
  }, []);

  return (
    <section ref={scope} className="py-24 lg:py-32 px-6 lg:px-8 bg-cream relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 bg-mint-100 blob opacity-50" />

      <div className="relative max-w-4xl mx-auto text-center">
        <Quote data-stagger className="w-12 h-12 text-mint-400 mx-auto mb-8" />

        <blockquote data-stagger className="fraunces-display text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight">
          "{t('landing.testimonial.quote')}"
        </blockquote>

        <div data-stagger className="flex items-center justify-center gap-1 mt-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
          ))}
        </div>

        <div data-stagger className="mt-8 inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-200 to-mint-400 border-2 border-paper shadow-soft flex items-center justify-center text-paper fraunces-display text-lg">
            A
          </div>
          <div className="text-left">
            <p className="font-semibold text-ink text-sm">{t('landing.testimonial.author')}</p>
            <p className="text-xs text-muted">{t('landing.testimonial.role')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
