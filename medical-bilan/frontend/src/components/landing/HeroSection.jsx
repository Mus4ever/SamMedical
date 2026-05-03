import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ArrowRight, Sparkles, Shield, Bell, FileCheck2, Phone, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';

const HeroSection = () => {
  const { t } = useTranslation();
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-eyebrow',  { opacity: 0, y: 20, duration: 0.7 })
        .from('.hero-title',    { opacity: 0, y: 40, duration: 1.0 }, '-=0.3')
        .from('.hero-desc',     { opacity: 0, y: 20, duration: 0.8 }, '-=0.5')
        .from('.hero-cta',      { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from('.hero-trust',    { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
        .from('.hero-phone',    { opacity: 0, scale: 0.9, duration: 1.2, ease: 'back.out(1.4)' }, '-=1.4')
        .from('.hero-card',     { opacity: 0, scale: 0.6, y: 30, duration: 0.8, stagger: 0.12 }, '-=0.7');
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="home"
      className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 lg:px-8 overflow-hidden mesh-mint"
    >
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-mint-200 blob animate-blob" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-sky-100 blob animate-blob" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-amber-100 blob animate-blob" style={{ animationDelay: '6s' }} />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* LEFT */}
        <div className="lg:col-span-7 text-center lg:text-left">
          <div className="hero-eyebrow inline-flex items-center gap-2 glass-mint rounded-full px-4 py-1.5 text-xs text-mint-700 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            {t('landing.hero.eyebrow')}
          </div>

          <h1 className="hero-title display text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] text-ink mt-6">
            {t('landing.hero.headlinePart1')}{' '}
            <span className="highlight-mint">{t('landing.hero.headlineHighlight1')}</span>{t('landing.hero.headlinePart2')}<br />
            <span className="display-italic text-muted">{t('landing.hero.headlineEm')}</span>
          </h1>

          <p className="hero-desc text-base sm:text-lg text-muted mt-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {t('landing.hero.description')}
          </p>

          <div className="hero-cta mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 bg-ink text-paper font-medium shadow-soft-lg hover:scale-[1.03] transition-all">
              {t('landing.hero.primaryCta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features" className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 glass text-ink font-medium hover:bg-white/80 transition-all">
              {t('landing.hero.secondaryCta')}
            </a>
          </div>

          <div className="hero-trust mt-12 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['bg-mint-300', 'bg-sky-300', 'bg-amber-200', 'bg-peach-200'].map((c, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full border-2 border-paper ${c} flex items-center justify-center text-xs font-medium text-ink shadow-sm`}>
                    {['A', 'M', 'F', 'K'][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-medium text-ink text-sm mono">500+</p>
                <p className="text-xs text-muted">{t('landing.hero.trust')}</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-ink/10" />
            <a href="#contact" className="inline-flex items-center gap-2 text-sm text-ink hover:text-mint-600 transition group">
              <span className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center group-hover:bg-mint-600 transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
              {t('landing.hero.partnership')}
            </a>
          </div>
        </div>

        {/* RIGHT — Phone mockup */}
        <div className="lg:col-span-5 relative">
          <div className="relative max-w-sm mx-auto h-[560px]">
            <div className="hero-phone absolute inset-0 mx-auto w-[280px] h-[560px] bg-ink rounded-[3rem] p-3 shadow-soft-xl">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-ink rounded-b-2xl z-10" />
              <div className="relative w-full h-full rounded-[2.25rem] overflow-hidden bg-gradient-to-br from-mint-50 via-paper to-sky-50">
                <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[10px] text-ink font-medium mono">
                  <span>9:41</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-ink" /><span className="w-1 h-1 rounded-full bg-ink" /><span className="w-1 h-1 rounded-full bg-ink" />
                    <span className="w-3 h-2 border border-ink rounded-sm relative"><span className="absolute inset-0.5 bg-mint-500 rounded-sm" /></span>
                  </span>
                </div>
                <div className="px-5 pt-6">
                  <p className="eyebrow text-muted">Bonjour</p>
                  <p className="display text-2xl text-ink mt-1">Mes résultats</p>
                  <div className="mt-5 p-4 rounded-2xl bg-mint-100 border border-mint-200 relative overflow-hidden">
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-mint-500 text-paper text-[8px] font-medium uppercase tracking-wider">Nouveau</div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-mint-500 text-paper flex items-center justify-center flex-shrink-0"><FileCheck2 className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink leading-tight">Analyse de sang</p>
                        <p className="text-[10px] text-muted mt-0.5">Disponible · il y a 5 min</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[
                      { icon: 'sky',   title: 'Bilan radio',   sub: 'Consulté · hier' },
                      { icon: 'amber', title: 'Hormones',      sub: 'Consulté · 3 jours' },
                    ].map((b) => (
                      <div key={b.title} className="p-3 rounded-2xl bg-paper border border-ink/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl bg-${b.icon}-100 flex items-center justify-center`}>
                            <FileCheck2 className={`w-3.5 h-3.5 text-${b.icon === 'sky' ? 'sky-600' : 'amber-500'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-medium text-ink">{b.title}</p>
                            <p className="text-[9px] text-muted">{b.sub}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="hero-card absolute top-12 -left-4 lg:-left-12 glass rounded-2xl p-3 shadow-soft-lg w-48 animate-float">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-mint-100 text-mint-700 flex items-center justify-center flex-shrink-0"><MessageSquare className="w-3.5 h-3.5" /></div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted">SMS · maintenant</p>
                  <p className="text-[11px] font-medium text-ink leading-tight mt-0.5">نتائجكم جاهزة ✓</p>
                </div>
              </div>
            </div>
            <div className="hero-card absolute top-44 -right-4 lg:-right-12 glass rounded-2xl p-3 shadow-soft-lg w-48 animate-float-slow" style={{ animationDelay: '1s' }}>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0"><Mail className="w-3.5 h-3.5" /></div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted">Email · 2 min</p>
                  <p className="text-[11px] font-medium text-ink leading-tight mt-0.5">Vos résultats</p>
                </div>
              </div>
            </div>
            <div className="hero-card absolute bottom-32 -left-6 lg:-left-16 glass-mint rounded-full px-4 py-2 shadow-soft-lg animate-float" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-2 text-xs font-medium text-mint-700">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inset-0 rounded-full bg-mint-400 opacity-75" />
                  <span className="relative w-2 h-2 rounded-full bg-mint-500" />
                </span>
                <Phone className="w-3.5 h-3.5" />
                Appel en cours
              </div>
            </div>
            <div className="hero-card absolute bottom-8 -right-2 lg:-right-8 glass rounded-2xl p-3 shadow-soft-lg w-40 animate-float-slow" style={{ animationDelay: '4s' }}>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-peach-100 text-peach-400 flex items-center justify-center flex-shrink-0"><Shield className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[11px] font-medium text-ink leading-tight">Sécurisé</p>
                  <p className="text-[9px] text-muted mt-0.5">Bout en bout</p>
                </div>
              </div>
            </div>
            <div className="hero-card absolute top-4 right-4 lg:right-0 glass rounded-full px-3 py-1.5 shadow-soft animate-float-slow" style={{ animationDelay: '3s' }}>
              <div className="flex items-center gap-1.5 text-[10px] text-ink">
                <CheckCircle2 className="w-3 h-3 text-mint-600" />
                <span className="font-medium mono">3</span> nouveaux
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
