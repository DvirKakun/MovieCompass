import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import MovieRoller from "../components/dashboard/MovieRoller";
import CategorySidebar from "../components/dashboard/CategorySidebar";
import CategoryResults from "../components/dashboard/CategoryResults";
import { useMovies } from "../contexts/MoviesContext";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import AIRecommendationsResults from "../components/dashboard/AIRecommendationsResultsProps ";

type ViewMode = "home" | "category" | "ai-recommendations";

interface CategoryState {
  genreId: number | null;
  genreName: string;
}

export default memo(function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryState | null>(null);

  const { state, fetchGenres } = useMovies();
  const { genres, genresLoading, genresError, moviesLoading, moviesError } =
    state;

  // Fetch genres on component mount
  useEffect(() => {
    fetchGenres();
  }, []);

  const handleCategorySelect = (genreId: number | null, genreName: string) => {
    setSelectedCategory({ genreId, genreName });
    setViewMode("category");
  };

  const handleAIRecommendations = () => {
    setSelectedCategory({ genreId: null, genreName: "AI Recommendations" });
    setViewMode("ai-recommendations");
  };

  const handleBackToHome = () => {
    setViewMode("home");
    setSelectedCategory(null);
  };

  // Loading state for initial genres fetch
  if (genresLoading && genres.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-secondary">Loading movie genres...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state for genres fetch
  if (genresError) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <p className="text-destructive">Failed to load genres</p>
            <p className="text-secondary text-sm">{genresError}</p>
            <button
              onClick={fetchGenres}
              className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-cta_hover transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        {/* Browse Categories Button - Only show on home view */}
        {viewMode === "home" && (
          <div className="container mx-auto px-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 mb-4"
            >
              <Menu className="w-4 h-4" />
              Browse Categories
            </Button>
          </div>
        )}

        <main className="py-8">
          <AnimatePresence mode="wait">
            {(viewMode === "category" || viewMode === "ai-recommendations") &&
              selectedCategory && (
                <motion.div
                  key={
                    viewMode === "ai-recommendations"
                      ? "ai-recommendations"
                      : "category-results"
                  }
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {viewMode === "ai-recommendations" ? (
                    <AIRecommendationsResults onBack={handleBackToHome} />
                  ) : (
                    <CategoryResults
                      categoryName={selectedCategory.genreName}
                      genreId={selectedCategory.genreId}
                      onBack={handleBackToHome}
                    />
                  )}
                </motion.div>
              )}

            {viewMode === "home" && (
              <motion.div
                key="movie-rollers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Welcome Header */}
                <div className="container mx-auto px-4">
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome to MovieCompass
                  </h1>
                  <p className="text-secondary">
                    Discover your next favorite movie
                  </p>
                </div>

                {/* Movie Rollers by Genre */}
                <div className="space-y-8">
                  {/* Popular Movies Roller */}
                  <MovieRoller title="Popular Movies" genreId={null} />

                  {/* Genre-based Rollers */}
                  {genres.map((genre) => (
                    <MovieRoller
                      key={genre.id}
                      title={genre.name}
                      genreId={genre.id}
                    />
                  ))}
                </div>

                {/* Loading state for rollers */}
                {moviesLoading && (
                  <div className="container mx-auto px-4">
                    <div className="flex items-center space-x-2 text-secondary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading movies...</span>
                    </div>
                  </div>
                )}

                {/* Error state for rollers */}
                {moviesError && (
                  <div className="container mx-auto px-4">
                    <div className="flex items-center space-x-2 text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span>{moviesError}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Category Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <CategorySidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onCategorySelect={handleCategorySelect}
              onAIRecommendations={handleAIRecommendations}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
});
