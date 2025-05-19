import SignUpButton from "../common/SignUpButton";
import { useNavigate } from "react-router-dom";

export default function HeroCTA() {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate("/auth?mode=signup");
  };

  return (
    <div className="space-y-8">
      {/* Main Headline */}
      <div className="space-y-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary leading-tight">
          Discover Your Next
          <span className="text-brand block">Favorite Movie</span>
        </h1>
        <p className="font-sans text-lg sm:text-xl text-secondary max-w-lg leading-relaxed">
          Navigate through thousands of movies with personalized
          recommendations, detailed reviews, and smart search features powered
          by AI.
        </p>
      </div>

      {/* CTA Button */}
      <SignUpButton
        className="w-full sm:w-auto text-lg px-8 py-3"
        onClick={handleSignupClick}
      >
        Get Started Free
      </SignUpButton>
    </div>
  );
}
