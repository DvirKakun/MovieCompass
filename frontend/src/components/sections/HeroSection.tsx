import CinemaVideo from "../hero/CinemaVideo";
import HeroCTA from "../hero/HeroCTA";

export default function HeroSection() {
  return (
    <section id="hero" className="min-h-screen flex items-center bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - CTA */}
          <HeroCTA />

          {/* Right Content - Animation */}
          <CinemaVideo
            videoSrc="/videos/family_animation_video.mp4"
            title="Family Movie Time"
          />
        </div>
      </div>
    </section>
  );
}
