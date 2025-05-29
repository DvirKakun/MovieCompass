import AboutHeader from "../about/AboutHeader";
import AboutStats from "../about/AboutStats";
import AboutContent from "../about/AboutContent";
import AboutFeatures from "../about/AboutFeatures";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Section Header */}
        <AboutHeader />

        {/* Stats Grid */}
        <AboutStats />

        {/* Main Content Grid */}
        <AboutContent />

        {/* Features Grid */}
        <AboutFeatures />
      </div>
    </section>
  );
}
