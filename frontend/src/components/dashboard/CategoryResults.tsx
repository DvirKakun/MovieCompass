import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { useMovies } from "../../contexts/MoviesContext";
import MovieCard from "./MovieCard";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import CategoryFilterPanel from "../common/CategoryFilterPanel";

interface CategoryFilters {
  minRating: number | null;
  maxRating: number | null;
  minYear: number | null;
  maxYear: number | null;
}

interface CategoryResultsProps {
  categoryName: string;
  genreId: number | null;
  onBack: () => void;
}

export default function CategoryResults({
  categoryName,
  genreId,
  onBack,
}: CategoryResultsProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilters>({
    minRating: null,
    maxRating: null,
    minYear: null,
    maxYear: null,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [localFetchingState, setLocalFetchingState] = useState(false);

  const {
    state,
    getMoviesByGenre,
    getPopularMovies,
    fetchGenrePage,
    fetchPopularPage,
  } = useMovies();

  // Get all movies based on category type
  const allMovies = genreId ? getMoviesByGenre(genreId) : getPopularMovies();
  const hasMore = genreId
    ? state.hasMoreByGenre.get(genreId) ?? true
    : state.popularHasMore;

  // ❌ FIX: Don't rely on global loading state - use local state instead
  const isLoading = localFetchingState;
  const hasError = state.moviesError || state.popularError;

  // Apply filters locally (same logic as SearchResults)
  const filteredMovies = useMemo(() => {
    if (!allMovies.length) return [];

    const currentYear = new Date().getFullYear();

    // Check if any filters are active
    const hasActiveFilters =
      (categoryFilters.minRating !== null && categoryFilters.minRating !== 0) ||
      (categoryFilters.maxRating !== null &&
        categoryFilters.maxRating !== 10) ||
      (categoryFilters.minYear !== null && categoryFilters.minYear !== 1900) ||
      (categoryFilters.maxYear !== null &&
        categoryFilters.maxYear !== currentYear);

    // If no filters, return all movies
    if (!hasActiveFilters) {
      return allMovies;
    }

    // Apply filters efficiently
    return allMovies.filter((movie) => {
      // Rating filter
      const rating = movie.vote_average || 0;
      if (
        categoryFilters.minRating !== null &&
        rating < categoryFilters.minRating
      ) {
        return false;
      }
      if (
        categoryFilters.maxRating !== null &&
        rating > categoryFilters.maxRating
      ) {
        return false;
      }

      // Year filter
      const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : 0;
      if (categoryFilters.minYear !== null && year < categoryFilters.minYear) {
        return false;
      }
      if (categoryFilters.maxYear !== null && year > categoryFilters.maxYear) {
        return false;
      }

      return true;
    });
  }, [allMovies, categoryFilters]);

  // Smart fetch logic - EXACTLY like SearchResults
  const needsMoreResults = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const hasActiveFilters =
      (categoryFilters.minRating !== null && categoryFilters.minRating !== 0) ||
      (categoryFilters.maxRating !== null &&
        categoryFilters.maxRating !== 10) ||
      (categoryFilters.minYear !== null && categoryFilters.minYear !== 1900) ||
      (categoryFilters.maxYear !== null &&
        categoryFilters.maxYear !== currentYear);

    const result = !hasActiveFilters
      ? hasMore
      : hasMore && allMovies.length > 0;

    return result;
  }, [
    categoryFilters,
    hasMore,
    allMovies.length,
    filteredMovies.length,
    genreId,
    categoryName,
  ]);

  // Count active filters
  const currentYear = new Date().getFullYear();
  const activeFiltersCount = Object.entries(categoryFilters).filter(
    ([key, value]) => {
      if (key === "minRating" && value !== null && value !== 0) return true;
      if (key === "maxRating" && value !== null && value !== 10) return true;
      if (key === "minYear" && value !== null && value !== 1900) return true;
      if (key === "maxYear" && value !== null && value !== currentYear)
        return true;
      return false;
    }
  ).length;

  // Load first page on mount only if no movies exist
  useEffect(() => {
    if (allMovies.length === 0) {
      setLocalFetchingState(true);
      const fetchPromise =
        genreId !== null ? fetchGenrePage(genreId, 1) : fetchPopularPage(1);

      fetchPromise.finally(() => {
        setLocalFetchingState(false);
      });
    }
  }, [genreId, fetchGenrePage, fetchPopularPage, allMovies.length]);

  // Fetch next page function - EXACTLY like SearchResults
  const fetchNextPage = useCallback(async () => {
    // Don't fetch if:
    // 1. No more results needed
    // 2. Already loading locally or globally
    // 3. Currently loading more
    if (!needsMoreResults || isLoading || isLoadingMore || localFetchingState) {
      return;
    }

    setIsLoadingMore(true);
    setLocalFetchingState(true);
    try {
      if (genreId !== null) {
        await fetchGenrePage(genreId);
      } else {
        await fetchPopularPage();
      }
    } catch (error) {
      console.error("CategoryResults: Fetch failed", error);
    } finally {
      setIsLoadingMore(false);
      setLocalFetchingState(false);
    }
  }, [
    needsMoreResults,
    isLoading,
    isLoadingMore,
    localFetchingState,
    genreId,
    fetchGenrePage,
    fetchPopularPage,
    categoryName,
    allMovies.length,
    hasMore,
  ]);

  // Use infinite scroll hook - EXACTLY like SearchResults
  const { sentinelRef } = useInfiniteScroll({
    fetchFn: fetchNextPage,
    hasMore: needsMoreResults,
    isLoading: isLoading || isLoadingMore || localFetchingState, // Include local state
    rootMargin: "400px",
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<CategoryFilters>) => {
    setCategoryFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setCategoryFilters({
      minRating: null,
      maxRating: null,
      minYear: null,
      maxYear: null,
    });
  };

  if (isLoading && allMovies.length === 0) {
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

        {/* Results Summary and Filter Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {categoryName}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-secondary">
                {filteredMovies.length} movie
                {filteredMovies.length !== 1 ? "s" : ""} found
                {activeFiltersCount > 0 &&
                  ` (filtered from ${allMovies.length})`}
              </p>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  {activeFiltersCount} filter
                  {activeFiltersCount !== 1 ? "s" : ""} applied
                </Badge>
              )}
            </div>
          </div>

          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge
                variant="default"
                className="bg-primary text-background text-xs px-2 py-0.5"
              >
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Category Filter Panel */}
      <CategoryFilterPanel
        showFilters={showFilters}
        filters={categoryFilters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Movies Grid */}
      <div className="container mx-auto px-4">
        {filteredMovies.length === 0 && allMovies.length > 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-secondary text-lg font-medium">
                    No movies match your filters
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Found {allMovies.length} total results, but none match your
                    current filters
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredMovies.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-secondary text-lg font-medium">
                    No {categoryName.toLowerCase()} found
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    We couldn't find any movies in this category
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
            {filteredMovies.map((movie, index) => (
              <motion.div
                key={`${movie.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Smart Loading Indicator - Only show when actually beneficial */}
        {isLoadingMore && needsMoreResults && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-secondary">
                {allMovies.length === 0
                  ? `Loading ${categoryName.toLowerCase()}...`
                  : "Loading more movies..."}
              </p>
            </div>
          </div>
        )}

        {/* End of results indicator */}
        {!needsMoreResults && filteredMovies.length > 0 && (
          <div className="text-center py-8">
            <p className="text-secondary text-sm">
              {activeFiltersCount > 0
                ? `Showing all ${filteredMovies.length} movies that match your filters`
                : `You've reached the end of ${categoryName.toLowerCase()}`}
            </p>
          </div>
        )}

        {/* Sentinel for infinite scroll - Only render when we need more results */}
        {needsMoreResults && <div ref={sentinelRef} className="h-1" />}
      </div>
    </div>
  );
}
