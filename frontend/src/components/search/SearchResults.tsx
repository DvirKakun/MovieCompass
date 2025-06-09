import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  Loader2,
  AlertCircle,
  Search,
  ChevronDown,
} from "lucide-react";
import { useMovies } from "../../contexts/MoviesContext";
import MovieCard from "../dashboard/MovieCard";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import FilterPanel from "../common/FilterPanel";

export default function SearchResults() {
  const [showFilters, setShowFilters] = useState(false);
  const [allSearchResults, setAllSearchResults] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isResettingSearch, setIsResettingSearch] = useState(false);
  const currentQueryRef = useRef<string>("");

  const {
    state: {
      searchQuery,
      searchResults,
      searchHasMore,
      searchLoading,
      searchError,
      filters,
    },
    fetchSearchPage,
    resetFilters,
  } = useMovies();

  // Keep track of all fetched results locally to avoid re-filtering massive arrays
  useEffect(() => {
    setAllSearchResults(searchResults);
  }, [searchResults]);

  // Apply filters locally with performance optimization
  const filteredResults = useMemo(() => {
    if (!allSearchResults.length) return [];

    const currentYear = new Date().getFullYear();

    // Check if any filters are active
    const hasActiveFilters =
      filters.genre !== null ||
      (filters.minRating !== null && filters.minRating !== 0) ||
      (filters.maxRating !== null && filters.maxRating !== 10) ||
      (filters.minYear !== null && filters.minYear !== 1900) ||
      (filters.maxYear !== null && filters.maxYear !== currentYear);

    // If no filters, return all results
    if (!hasActiveFilters) {
      return allSearchResults;
    }

    // Apply filters efficiently
    return allSearchResults.filter((movie) => {
      // Genre filter
      if (filters.genre !== null) {
        const genreIds =
          movie.genre_ids ?? movie.genres?.map((g: any) => g.id) ?? [];

        if (!genreIds.includes(filters.genre)) return false;
      }

      // Rating filter
      if (filters.minRating !== null && movie.vote_average < filters.minRating)
        return false;
      if (filters.maxRating !== null && movie.vote_average > filters.maxRating)
        return false;

      // Year filter
      const movieYear = new Date(movie.release_date).getFullYear();
      if (filters.minYear !== null && movieYear < filters.minYear) return false;
      if (filters.maxYear !== null && movieYear > filters.maxYear) return false;

      return true;
    });
  }, [allSearchResults, filters]);

  // Smart fetch logic - only show loading when we need more filtered results
  const needsMoreResults = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const hasActiveFilters =
      filters.genre !== null ||
      (filters.minRating !== null && filters.minRating !== 0) ||
      (filters.maxRating !== null && filters.maxRating !== 10) ||
      (filters.minYear !== null && filters.minYear !== 1900) ||
      (filters.maxYear !== null && filters.maxYear !== currentYear);

    if (!hasActiveFilters) {
      return searchHasMore; // No filters, use backend pagination
    }

    // With filters: only fetch more if we have very few filtered results and more data is available
    return (
      searchHasMore &&
      filteredResults.length < 20 &&
      allSearchResults.length > 0
    );
  }, [filters, searchHasMore, filteredResults.length, allSearchResults.length]);

  // Optimized fetch function - only fetch next page if we're continuing the same search
  const fetchNextPage = useCallback(async () => {
    // Don't fetch if:
    // 1. No search query
    // 2. Currently resetting search
    // 3. No more results needed
    // 4. Already loading
    // 5. Query changed (we're starting a new search)
    if (
      !searchQuery.trim() ||
      isResettingSearch ||
      !needsMoreResults ||
      searchLoading ||
      isLoadingMore ||
      currentQueryRef.current !== searchQuery
    ) {
      return;
    }

    setIsLoadingMore(true);
    try {
      await fetchSearchPage(searchQuery);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    searchQuery,
    isResettingSearch,
    needsMoreResults,
    searchLoading,
    isLoadingMore,
    fetchSearchPage,
  ]);

  // Use infinite scroll hook with smart loading
  const { sentinelRef } = useInfiniteScroll({
    fetchFn: fetchNextPage,
    hasMore:
      needsMoreResults &&
      !isResettingSearch &&
      currentQueryRef.current === searchQuery,
    isLoading: searchLoading || isLoadingMore || isResettingSearch,
    rootMargin: "400px",
  });

  // Handle search query changes
  useEffect(() => {
    if (!searchQuery.trim()) return;

    // Check if this is a new search query
    const isNewQuery = currentQueryRef.current !== searchQuery;

    if (isNewQuery) {
      // Set flags for new search
      setIsResettingSearch(true);
      currentQueryRef.current = searchQuery;

      // Reset local state for new search
      setAllSearchResults([]);
      setIsLoadingMore(false);

      // Fetch first page
      fetchSearchPage(searchQuery, 1).finally(() => {
        // Allow infinite scroll after initial fetch completes
        setIsResettingSearch(false);
      });
    }
    // If it's the same query, do nothing (prevent duplicate fetches)
  }, [searchQuery, fetchSearchPage]);

  const currentYear = new Date().getFullYear();

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "genre" && value !== null) return true;
    if (key === "minRating" && value !== null && value !== 0) return true;
    if (key === "maxRating" && value !== null && value !== 10) return true;
    if (key === "minYear" && value !== null && value !== 1900) return true;
    if (key === "maxYear" && value !== null && value !== currentYear)
      return true;
    return false;
  }).length;

  // Show loading only for initial search or when we actually need more results
  const showLoadingIndicator =
    (searchLoading && allSearchResults.length === 0) ||
    (isLoadingMore && needsMoreResults) ||
    isResettingSearch;

  if (!searchQuery.trim()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Search for Movies
            </h3>
            <p className="text-secondary">
              Enter a movie title, actor name, or genre to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state for initial search
  if ((searchLoading || isResettingSearch) && allSearchResults.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-secondary">Searching movies...</p>
        </div>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-destructive">Search failed</p>
          <p className="text-secondary text-sm">{searchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Search Results for "{searchQuery}"
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-secondary">
                {filteredResults.length} movie
                {filteredResults.length !== 1 ? "s" : ""} found
                {activeFiltersCount > 0 &&
                  ` (filtered from ${allSearchResults.length})`}
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

      {/* Filter Panel */}
      <FilterPanel
        showFilters={showFilters}
        filters={filters}
        onFilterChange={() => {}} // Not used when useContextFilters=true
        onResetFilters={() => {}} // Not used when useContextFilters=true
        activeFiltersCount={activeFiltersCount}
        useContextFilters={true}
      />

      {/* Search Results Grid */}
      <div className="container mx-auto px-4">
        {filteredResults.length === 0 && allSearchResults.length > 0 ? (
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
                    Found {allSearchResults.length} total results, but none
                    match your current filters
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredResults.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-secondary text-lg font-medium">
                    No movies found
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Try different search terms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {filteredResults.map((movie, index) => (
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

        {/* Smart Loading Indicator - Only show when actually beneficial */}
        {showLoadingIndicator && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-secondary">
                {allSearchResults.length === 0
                  ? "Searching movies..."
                  : "Loading more movies..."}
              </p>
            </div>
          </div>
        )}

        {/* End of results indicator */}
        {!needsMoreResults &&
          filteredResults.length > 0 &&
          !isResettingSearch && (
            <div className="text-center py-8">
              <p className="text-secondary text-sm">
                {activeFiltersCount > 0
                  ? `Showing all ${filteredResults.length} movies that match your filters`
                  : "You've reached the end of search results"}
              </p>
            </div>
          )}

        {/* Sentinel for infinite scroll - Only render when we need more results */}
        {needsMoreResults &&
          !isResettingSearch &&
          currentQueryRef.current === searchQuery && (
            <div ref={sentinelRef} className="h-1" />
          )}
      </div>
    </div>
  );
}
