import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileCheck2, Bell, Users, Send, Eye, MessageSquare } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const screens = [
  {
    title: 'Notifications patient',
    subtitle: 'SMS · Appel · Email',
    accent: 'mint',
    icon: Bell,
    items: [
      { icon: MessageSquare, label: 'SMS reçu', color: 'mint',  time: 'maintenant' },
      { icon: Send,          label: 'Email envoyé', color: 'sky',   time: '2 min' },
      { icon: FileCheck2,    label: 'Bilan consulté', color: 'amber', time: '5 min' },
    ],
  },
  {
    title: 'Liste des patients',
    subtitle: '527 patients enregistrés',
    accent: 'sky',
    icon: Users,
    items: [
      { initial: 'M', name: 'Mohamed B.', sub: '+213 770 ...', color: 'mint' },
      { initial: 'S', name: 'Souad K.',   sub: '+213 660 ...', color: 'sky' },
      { initial: 'K', name: 'Karim L.',   sub: '+213 550 ...', color: 'amber' },
    ],
  },
  {
    title: 'Mes résultats',
    subtitle: '3 nouveaux bilans',
    accent: 'amber',
    icon: FileCheck2,
    items: [
      { title: 'Analyse de sang',     status: 'Nouveau',   color: 'mint' },
      { title: 'Bilan radiologique',  status: 'Consulté',  color: 'sky' },
      { title: 'Bilan hormones',      status: 'Consulté',  color: 'amber' },
    ],
  },
];

const accentBg = {
  mint:  'bg-mint-100',
  sky:   'bg-sky-100',
  amber: 'bg-amber-100',
};
const accentText = {
  mint:  'text-mint-700',
  sky:   'text-sky-600',
  amber: 'text-amber-500',
};

const ScreensGallery = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;
      const distance = track.scrollWidth - track.clientWidth;
      if (distance <= 0) return;

      gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${distance + 200}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-cream py-20 overflow-hidden">
      <div className="px-6 lg:px-8 mb-12 max-w-7xl mx-auto">
        <p className="eyebrow text-mint-600">Galerie</p>
        <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-ink mt-3" style={{ letterSpacing: '-1.5px' }}>
          Chaque écran, <span className="display-italic text-muted">pensé.</span>
        </h2>
        <p className="text-muted mt-4 text-base max-w-xl">
          Trois aperçus de l'application — pour les patients comme pour les médecins.
        </p>
      </div>

      <div ref={trackRef} className="flex gap-6 px-6 lg:px-12 will-change-transform">
        {screens.map((screen, idx) => {
          const HeaderIcon = screen.icon;
          return (
            <div
              key={idx}
              className="flex-shrink-0 w-[320px] sm:w-[400px] glass rounded-[2rem] shadow-soft-lg p-6 border border-ink/5"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-11 h-11 rounded-2xl ${accentBg[screen.accent]} ${accentText[screen.accent]} flex items-center justify-center`}>
                  <HeaderIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="display text-xl text-ink leading-tight">{screen.title}</p>
                  <p className="text-xs text-muted mt-0.5">{screen.subtitle}</p>
                </div>
              </div>

              {/* Items */}
              <ul className="space-y-2">
                {screen.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-paper border border-ink/5">
                    {/* Item icon — varies by screen type */}
                    {item.icon ? (
                      <div className={`w-9 h-9 rounded-xl ${accentBg[item.color]} ${accentText[item.color]} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                    ) : item.initial ? (
                      <div className={`w-9 h-9 rounded-xl ${accentBg[item.color]} ${accentText[item.color]} flex items-center justify-center flex-shrink-0 mono text-sm font-medium`}>
                        {item.initial}
                      </div>
                    ) : (
                      <div className={`w-9 h-9 rounded-xl ${accentBg[item.color]} ${accentText[item.color]} flex items-center justify-center flex-shrink-0`}>
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink truncate">
                        {item.label || item.name || item.title}
                      </p>
                      <p className="text-xs text-muted truncate mono">
                        {item.time || item.sub || item.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Spacer at end so last card can be fully visible */}
        <div className="flex-shrink-0 w-32" />
      </div>
    </section>
  );
};

export default ScreensGallery;
