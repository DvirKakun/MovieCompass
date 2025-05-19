import AboutMission from "./AboutMission";
import AboutTMDBIntegration from "./AboutTMDBIntegration";

export default function AboutContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
      {/* Left Content */}
      <AboutMission />

      {/* Right Visual */}
      <AboutTMDBIntegration />
    </div>
  );
}
