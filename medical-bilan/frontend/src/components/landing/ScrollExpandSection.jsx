import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll Expansion section — starts as a contained card (rounded, narrow),
 * expands to full width with no rounding as you scroll.
 */
const ScrollExpandSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(cardRef.current, { scale: 0.85, borderRadius: '3rem' });

      gsap.to(cardRef.current, {
        scale: 1,
        borderRadius: '0rem',
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6 lg:px-8 bg-paper overflow-hidden">
      <div
        ref={cardRef}
        className="relative max-w-7xl mx-auto mesh-mint border border-mint-200 shadow-soft-xl py-24 px-8 lg:px-16 text-center overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-mint-200 blob opacity-50" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-100 blob opacity-50" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-mint-700 font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Pour vous, plus simple
          </div>

          <h2
            className="display text-4xl sm:text-5xl lg:text-7xl text-ink"
            style={{ letterSpacing: '-2px', lineHeight: 1 }}
          >
            La santé sans <br />
            <span className="display-italic text-mint-700">paperasse.</span>
          </h2>

          <p className="text-muted mt-8 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Vos résultats vous parviennent dès qu'ils sont prêts. Plus de déplacement
            inutile, plus d'attente. Un système conçu pour respecter votre temps.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 mt-12 px-10 py-5 bg-ink text-paper rounded-full font-medium shadow-soft-lg hover:scale-[1.03] transition-all"
          >
            Commencer maintenant
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ScrollExpandSection;
