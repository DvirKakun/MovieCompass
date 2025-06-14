import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import WatchlistMovieCard from "../components/watchlist/WatchlistMovieCard";
import FilterPanel, {
  type MovieFilters,
} from "../components/common/FilterPanel";
import { useUserState } from "../contexts/UserContext";
import { useMovies } from "../contexts/MoviesContext";
import type { Movie } from "../types/movies";

type SortOption = "dateAdded" | "title" | "rating" | "year";
type SortOrder = "asc" | "desc";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { user } = useUserState();
  const [removedMovies, setRemovedMovies] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("dateAdded");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { fetchMoviesByIds, state: moviesState, getGenreName } = useMovies();

  // Filter states (local state for WatchlistPage)
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState<MovieFilters>({
    genre: null,
    minRating: null,
    maxRating: null,
    minYear: null,
    maxYear: null,
  });

  const watchlistIds = user?.watchlist || [];
  const displayedWatchlist = watchlistIds.filter(
    (id) => !removedMovies.has(id)
  );

  // Fetch movie details - use dependency on displayedWatchlist length and join to avoid infinite loops
  useEffect(() => {
    if (displayedWatchlist.length) {
      fetchMoviesByIds(displayedWatchlist);
    }
  }, [displayedWatchlist.length, displayedWatchlist.join(",")]); // Remove fetchMoviesByIds from dependencies

  // Get movies with full details
  const watchlistMovies = useMemo(() => {
    return displayedWatchlist
      .map((id) => moviesState.fetchedMoviesById.get(id))
      .filter((movie): movie is Movie => movie !== undefined);
  }, [displayedWatchlist.join(","), moviesState.fetchedMoviesById]);

  // Apply filters
  const filteredMovies = useMemo(() => {
    return watchlistMovies.filter((movie) => {
      // Genre filter
      if (filters.genre !== null) {
        const genreIds =
          movie.genre_ids ?? movie.genres?.map((g) => g.id) ?? [];
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
  }, [watchlistMovies, filters]);

  // Apply sorting
  const sortedMovies = useMemo(() => {
    const sorted = [...filteredMovies].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "rating":
          comparison = a.vote_average - b.vote_average;
          break;
        case "year":
          const yearA = new Date(a.release_date).getFullYear();
          const yearB = new Date(b.release_date).getFullYear();
          comparison = yearA - yearB;
          break;
        case "dateAdded":
        default:
          const indexA = watchlistIds.indexOf(a.id);
          const indexB = watchlistIds.indexOf(b.id);
          comparison = indexA - indexB;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredMovies, sortBy, sortOrder, watchlistIds]);

  // Filter out removed movies for smooth animation
  const handleMovieRemoved = (movieId: number) => {
    setRemovedMovies((prev) => new Set([...prev, movieId]));
    // Remove from local state after animation completes
    setTimeout(() => {
      setRemovedMovies((prev) => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
    }, 300);
  };

  // Filter handlers (same as FavoritesPage)
  const handleFilterChange = (newFilters: Partial<MovieFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      genre: null,
      minRating: null,
      maxRating: null,
      minYear: null,
      maxYear: null,
    });
  };

  // Count active filters (same logic as FavoritesPage)
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "genre" && value !== null) return true;
    if (key === "minRating" && value !== null && value !== 0) return true;
    if (key === "maxRating" && value !== null && value !== 10) return true;
    if (key === "minYear" && value !== null && value !== 1900) return true;
    if (key === "maxYear" && value !== null && value !== currentYear)
      return true;
    return false;
  }).length;

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="p-0 hover:bg-transparent"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Dashboard
                </Button>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      Your Watchlist
                    </h1>
                    <p className="text-secondary">
                      {sortedMovies.length} of {displayedWatchlist.length} movie
                      {displayedWatchlist.length !== 1 ? "s" : ""} saved to
                      watch later
                      {activeFiltersCount > 0 && " (filtered)"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={(value: SortOption) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dateAdded">Date Added</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </Button>
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

                {displayedWatchlist.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary px-3 py-1"
                  >
                    {displayedWatchlist.length} movie
                    {displayedWatchlist.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            <FilterPanel
              showFilters={showFilters}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              activeFiltersCount={activeFiltersCount}
              genres={moviesState.genres}
              getGenreName={getGenreName}
            />

            {/* Watchlist Content */}
            <AnimatePresence mode="popLayout">
              {displayedWatchlist.length === 0 ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                        <Bookmark className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Your Watchlist is Empty
                      </h3>
                      <p className="text-secondary text-center mb-6 max-w-md">
                        Start building your watchlist by adding movies you want
                        to watch later. Browse movies and click the bookmark
                        icon to add them here.
                      </p>
                      <Button onClick={() => navigate("/dashboard")}>
                        Browse Movies
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : sortedMovies.length === 0 ? (
                <motion.div
                  key="no-filtered-results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Filter className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No Movies Match Your Filters
                      </h3>
                      <p className="text-secondary text-center mb-4">
                        Try adjusting your filters to see more results
                      </p>
                      <Button variant="outline" onClick={handleResetFilters}>
                        Clear All Filters
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="watchlist-grid" className="space-y-4" layout>
                  {sortedMovies.map((movie) => (
                    <WatchlistMovieCard
                      key={movie.id}
                      movieId={movie.id}
                      onRemove={() => handleMovieRemoved(movie.id)}
                    />
                  ))}
                  {moviesState.fetchedMoviesLoading && (
                    <p className="text-center text-secondary mt-4">
                      Loading details&hellip;
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </>
  );
}
