import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LayoutDashboard, Users, FileText, CheckCircle2, Clock, Send } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Container Scroll Animation — Aceternity-style.
 * The mockup container starts tilted back (rotateX 20°, scale 0.85)
 * and unfolds to flat (rotateX 0°, scale 1) as the user scrolls through.
 *
 * Scroll behaviour: scrub-pinned during the unfolding window.
 */
const ScrollShowcase = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header rotates/scales the container
      gsap.set(containerRef.current, {
        rotateX: 20,
        scale: 0.85,
        transformPerspective: 1000,
      });
      gsap.set(headerRef.current, { y: 0, opacity: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=120%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(headerRef.current, { y: -80, opacity: 0.4, ease: 'power2.in' }, 0)
        .to(containerRef.current, { rotateX: 0, scale: 1, ease: 'power2.out' }, 0);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center px-6 lg:px-8 py-20 mesh-soft overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-mint-200 blob opacity-50" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-sky-100 blob opacity-50" />

      <div className="relative w-full max-w-6xl mx-auto">
        {/* Header (text fades up and out as scroll progresses) */}
        <div ref={headerRef} className="text-center mb-12 lg:mb-16">
          <p className="eyebrow text-mint-600 mb-3">Aperçu de l'application</p>
          <h2
            className="display text-4xl sm:text-5xl lg:text-6xl text-ink"
            style={{ letterSpacing: '-1.5px' }}
          >
            Découvrez votre <span className="display-italic text-muted">tableau de bord.</span>
          </h2>
          <p className="text-muted mt-4 text-base max-w-xl mx-auto">
            Une interface pensée pour les médecins exigeants, fluide sur mobile comme sur desktop.
          </p>
        </div>

        {/* Mockup container — rotateX 20° → 0° on scroll */}
        <div
          ref={containerRef}
          className="relative mx-auto rounded-[2rem] glass shadow-soft-xl border border-ink/5 overflow-hidden"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-5 py-3 bg-ink/5 border-b border-ink/5">
            <span className="w-3 h-3 rounded-full bg-red-400/80" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80" />
            <span className="w-3 h-3 rounded-full bg-mint-400/80" />
            <span className="ml-3 text-xs text-muted mono">clinique.dz/admin/dashboard</span>
          </div>

          {/* Mock dashboard */}
          <div className="bg-paper p-6 lg:p-10">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="eyebrow text-muted">Tableau de bord</p>
                <h3 className="display text-3xl text-ink mt-1">Bonjour Dr.</h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-mint-100 text-mint-700 font-medium">+12 cette semaine</span>
            </div>

            {/* 4 stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Patients',     value: '527',  icon: Users,        accent: 'mint'  },
                { label: 'Bilans',       value: '1.2k', icon: FileText,     accent: 'sky'   },
                { label: 'En attente',   value: '12',   icon: Clock,        accent: 'amber' },
                { label: 'Notifiés',     value: '498',  icon: CheckCircle2, accent: 'peach' },
              ].map((s) => {
                const Icon = s.icon;
                const accentMap = {
                  mint:  'bg-mint-100 text-mint-700',
                  sky:   'bg-sky-100 text-sky-600',
                  amber: 'bg-amber-100 text-amber-500',
                  peach: 'bg-peach-100 text-peach-400',
                };
                return (
                  <div key={s.label} className="rounded-2xl border border-ink/5 p-4">
                    <div className={`w-9 h-9 rounded-xl ${accentMap[s.accent]} flex items-center justify-center mb-3`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="display text-3xl text-ink mono">{s.value}</p>
                    <p className="eyebrow text-muted mt-1">{s.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Mock activity row */}
            <div className="mt-6 rounded-2xl border border-ink/5 overflow-hidden">
              <div className="px-5 py-3 border-b border-ink/5 flex items-center gap-3">
                <Send className="w-4 h-4 text-muted" />
                <p className="text-sm font-medium text-ink">Activité récente</p>
              </div>
              <ul className="divide-y divide-ink/5">
                {[
                  { name: 'Mohamed B.', action: 'Bilan uploadé', time: 'il y a 5 min', color: 'mint' },
                  { name: 'Souad K.',  action: 'Notifié — SMS + Appel', time: 'il y a 12 min', color: 'sky' },
                  { name: 'Karim L.',  action: 'A consulté son bilan',  time: 'il y a 1h',  color: 'amber' },
                ].map((a, i) => (
                  <li key={i} className="flex items-center gap-3 p-3">
                    <div className={`w-9 h-9 rounded-2xl bg-${a.color}-100 text-${a.color === 'sky' ? 'sky-600' : a.color === 'amber' ? 'amber-500' : 'mint-700'} flex items-center justify-center text-xs font-medium mono`}>
                      {a.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink">{a.action}</p>
                      <p className="text-xs text-muted">{a.name}</p>
                    </div>
                    <span className="text-xs text-muted mono">{a.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollShowcase;
