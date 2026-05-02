import PublicNavbar    from '../components/common/PublicNavbar';
import Footer          from '../components/common/Footer';
import HeroSection     from '../components/landing/HeroSection';
import AboutSection    from '../components/landing/AboutSection';
import ServicesSection from '../components/landing/ServicesSection';
import ContactSection  from '../components/landing/ContactSection';

const Landing = () => (
  <div className="bg-paper">
    <PublicNavbar />
    <HeroSection />
    <AboutSection />
    <ServicesSection />
    <ContactSection />
    <Footer />
  </div>
);

export default Landing;
