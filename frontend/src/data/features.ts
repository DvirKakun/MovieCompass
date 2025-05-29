import { Brain, Grid3X3, User } from "lucide-react";

export const features = [
  {
    id: 1,
    icon: Brain,
    title: "AI Smart Recommendations",
    description:
      "Get personalized movie suggestions powered by AI analysis of your favorite movies, watchlist, and ratings. Our intelligent system learns your unique taste to discover hidden gems perfectly matched to your preferences.",
    benefits: [
      "Learns from your favorites, watchlist, and ratings",
      "Discovers hidden gems tailored to your taste",
      "Improves recommendations with every interaction",
    ],
    gradient: "from-brand/20 to-rating/20",
    position: "left" as const,
  },
  {
    id: 2,
    icon: Grid3X3,
    title: "Browse by Categories",
    description:
      "Explore movies through intuitive category browsing with advanced filtering options. Filter by genre, release year, and ratings to find exactly what you're in the mood for.",
    benefits: [
      "Browse movies by genre categories",
      "Filter by year and rating ranges",
      "Smart search with multiple criteria",
    ],
    gradient: "from-brand/20 to-primary/20",
    position: "right" as const,
  },
  {
    id: 3,
    icon: User,
    title: "Manage Your Movie Profile",
    description:
      "Take control of your movie experience with comprehensive profile management. Organize your watchlist, curate favorite movies, rate films you've watched, and customize your account settings.",
    benefits: [
      "Organize watchlist and favorite movies",
      "Rate and track your movie history",
      "Personalize profile and account settings",
    ],
    gradient: "from-primary/20 to-rating/20",
    position: "left" as const,
  },
];
