import AboutHeader from "../about/AboutHeader";
import AboutContent from "../about/AboutContent";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Section Header */}
        <AboutHeader />

        {/* Main Content Grid */}
        <AboutContent />
      </div>
    </section>
  );
}
