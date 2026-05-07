import PublicNavbar         from '../components/common/PublicNavbar';
import Footer               from '../components/common/Footer';
import HeroSection          from '../components/landing/HeroSection';
import StatsBar             from '../components/landing/StatsBar';
import FeaturesSection      from '../components/landing/FeaturesSection';
import ScrollShowcase       from '../components/landing/ScrollShowcase';
import HowItWorksSection    from '../components/landing/HowItWorksSection';
import ServicesSection      from '../components/landing/ServicesSection';
import ScreensGallery       from '../components/landing/ScreensGallery';
import ForDoctorsSection    from '../components/landing/ForDoctorsSection';
import TestimonialsCarousel from '../components/landing/TestimonialsCarousel';
import FaqSection           from '../components/landing/FaqSection';
import ScrollExpandSection  from '../components/landing/ScrollExpandSection';
import AboutSection         from '../components/landing/AboutSection';
import ContactSection       from '../components/landing/ContactSection';
import CtaSection           from '../components/landing/CtaSection';

const Landing = () => (
  <div className="bg-paper">
    <PublicNavbar />
    <HeroSection />
    <StatsBar />
    <FeaturesSection />
    <ScrollShowcase />          {/* ⭐ Aceternity-style container scroll */}
    <HowItWorksSection />
    <ServicesSection />
    <ScreensGallery />          {/* ⭐ Horizontal parallax gallery */}
    <ForDoctorsSection />
    <TestimonialsCarousel />
    <FaqSection />
    <ScrollExpandSection />     {/* ⭐ Scroll expansion CTA */}
    <AboutSection />
    <ContactSection />
    <CtaSection />
    <Footer />
  </div>
);

export default Landing;
