import MainLayout from "../components/layout/MainLayout";
import AboutSection from "../components/home/AboutSection";
import ContactSection from "../components/home/ContactSection";
import FeaturesSection from "../components/home/FeaturesSection";
import HeroSection from "../components/home/HeroSection";

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <ContactSection />
    </MainLayout>
  );
}
