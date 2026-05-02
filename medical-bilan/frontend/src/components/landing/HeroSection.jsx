import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import VideoBackground from './VideoBackground';

/**
 * Cinematic hero — full implementation per design brief.
 *
 * Layout structure:
 *   - relative min-h-screen w-full overflow-hidden
 *   - Background video layer (z-0)  + gradient overlay
 *   - Navigation bar handled by parent (z-20)
 *   - Hero content (z-10)
 */
const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section
      id="home"
      className="relative min-h-screen w-full overflow-hidden bg-paper"
    >
      {/* Video background (z-0) */}
      <VideoBackground />

      {/* Hero content (z-10) */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 pb-40"
        style={{ paddingTop: 'calc(8rem - 75px)' }}
      >
        {/* Headline — main text + italic emphasis (color split per brief) */}
        <h1
          className="font-serif font-normal text-5xl sm:text-7xl md:text-8xl max-w-7xl text-ink animate-fade-rise"
          style={{ lineHeight: 0.95, letterSpacing: '-2.46px' }}
        >
          {t('landing.hero.headlineMain')}{' '}
          <em className="not-italic" style={{ fontStyle: 'italic', color: '#6F6F6F' }}>
            {t('landing.hero.headlineEm')}
          </em>
        </h1>

        {/* Description */}
        <p
          className="text-base sm:text-lg max-w-2xl mt-8 leading-relaxed text-muted animate-fade-rise-delay"
        >
          {t('landing.hero.description')}
        </p>

        {/* CTA */}
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-full px-14 py-5 text-base mt-12
                     bg-ink text-paper font-medium transition-all duration-200
                     hover:scale-[1.03] active:scale-100 animate-fade-rise-delay-2"
        >
          {t('landing.hero.cta')}
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
