import { motion } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useMovies } from "../../contexts/MoviesContext";
import MovieCard from "./MovieCard";
import { useCallback, useEffect, useRef, useState } from "react";

interface CategoryResultsProps {
  categoryName: string;
  genreId: number | null;
  onBack: () => void;
  isAIRecommendations?: boolean;
}

export default function CategoryResults({
  categoryName,
  genreId,
  onBack,
  isAIRecommendations = false,
}: CategoryResultsProps) {
  const {
    state,
    getMoviesByGenre,
    getPopularMovies,
    fetchGenrePage,
    fetchPopularPage,
  } = useMovies();

  // Get movies based on category type
  const movies = genreId ? getMoviesByGenre(genreId) : getPopularMovies();
  const hasMore = genreId
    ? state.hasMoreByGenre.get(genreId) ?? true
    : state.popularHasMore;
  const isLoading = state.moviesLoading || state.popularLoading;
  const hasError = state.moviesError || state.popularError;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Load first page on mount
  useEffect(() => {
    if (genreId !== null) {
      fetchGenrePage(genreId, 1);
    } else {
      fetchPopularPage(1);
    }
  }, [genreId]);

  // Load next page when scrolling
  const loadNextPage = useCallback(async () => {
    if (isFetching || !hasMore) return;

    setIsFetching(true);
    try {
      if (genreId !== null) {
        await fetchGenrePage(genreId);
      } else {
        await fetchPopularPage();
      }
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, hasMore, genreId]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadNextPage(),
      { rootMargin: "600px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadNextPage]);

  if (isLoading && movies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-secondary">
              Loading {categoryName.toLowerCase()}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <p className="text-destructive">
              Failed to load {categoryName.toLowerCase()}
            </p>
            <p className="text-secondary text-sm">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 p-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Button>

        <div className="flex items-center gap-3">
          {isAIRecommendations && (
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {categoryName}
            </h2>
            <p className="text-secondary mt-1">
              {movies.length} movie{movies.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="container mx-auto px-4">
        {movies.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-secondary text-lg font-medium">
                    No movies found
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    No movies available in this category right now
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        )}
        {isFetching && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-secondary">Loading more movies...</p>
            </div>
          </div>
        )}
        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  );
}
