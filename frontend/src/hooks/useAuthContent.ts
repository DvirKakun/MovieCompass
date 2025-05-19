import { Star, Shield, Zap } from "lucide-react";

export function useAuthContent(isLogin: boolean) {
  const textContent = {
    login: {
      title: "Welcome Back!",
      subtitle: "Login to your account",
      description:
        "Access your personalized movie recommendations, saved favorites, and continue your cinematic journey.",
      features: [
        { icon: Star, text: "Personalized recommendations" },
        { icon: Shield, text: "Secure account protection" },
        { icon: Zap, text: "Instant access to content" },
      ],
      cta: "New to MovieCompass?",
      ctaButton: "Create Account",
    },
    signup: {
      title: "Join MovieCompass",
      subtitle: "Create your account",
      description:
        "Discover amazing movies, get AI-powered recommendations, and join our community of film enthusiasts.",
      features: [
        { icon: Star, text: "AI-powered recommendations" },
        { icon: Shield, text: "Safe & secure platform" },
        { icon: Zap, text: "Instant movie discovery" },
      ],
      cta: "Already have an account?",
      ctaButton: "Login",
    },
  };

  return isLogin ? textContent.login : textContent.signup;
}
