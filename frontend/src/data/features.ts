import { Brain, Download, Grid3X3, Star } from "lucide-react";

export const features = [
  {
    id: 1,
    icon: Brain,
    title: "AI Smart Recommendations",
    description:
      "Get personalized movie suggestions based on your watch history, ratings, and favorite genres. Our AI learns your taste to find hidden gems you'll love.",
    benefits: [
      "Personal taste analysis",
      "Hidden gem discovery",
      "Real-time preferences",
    ],
    gradient: "from-brand/20 to-rating/20",
    position: "left" as const,
  },
  {
    id: 2,
    icon: Download,
    title: "Instant Torrent Links",
    description:
      "Access high-quality torrent links for your favorite movies with verified sources and multiple quality options. Safe and secure downloads.",
    benefits: ["Verified sources", "Multiple qualities", "Fast downloads"],
    gradient: "from-rating/20 to-brand/20",
    position: "right" as const,
  },
  {
    id: 3,
    icon: Grid3X3,
    title: "Browse by Categories",
    description:
      "Explore movies through intuitive category filters including genre, year, rating, and language. Find exactly what you're in the mood for.",
    benefits: ["Advanced filters", "Genre exploration", "Smart search"],
    gradient: "from-brand/20 to-primary/20",
    position: "left" as const,
  },
  {
    id: 4,
    icon: Star,
    title: "Manage Your Ratings",
    description:
      "Rate movies you've watched and build your personal movie profile. Track your viewing history and share recommendations with friends.",
    benefits: ["Personal ratings", "Watch history", "Social sharing"],
    gradient: "from-primary/20 to-rating/20",
    position: "right" as const,
  },
];
