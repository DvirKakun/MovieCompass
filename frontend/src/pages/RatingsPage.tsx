import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  SortAsc,
  SortDesc,
  Filter,
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
import RatingMovieCard from "../components/ratings/RatingsMovieCard";
import FilterPanel, {
  type MovieFilters,
} from "../components/common/FilterPanel";
import { useUserState } from "../contexts/UserContext";
import { useMovies } from "../contexts/MoviesContext";
import type { Movie } from "../types/movies";

type SortOption = "dateRated" | "title" | "userRating" | "movieRating" | "year";
type SortOrder = "asc" | "desc";

export default function RatingsPage() {
  const navigate = useNavigate();
  const { user } = useUserState();
  const { fetchMoviesByIds, state: moviesState, getGenreName } = useMovies();

  const [removedMovies, setRemovedMovies] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("dateRated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states (local state for RatingsPage)
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState<MovieFilters>({
    genre: null,
    minRating: null,
    maxRating: null,
    minYear: null,
    maxYear: null,
  });

  const ratedMovieIds = user?.ratings.map((rating) => rating.movie_id) || [];
  const displayedRatings = ratedMovieIds.filter((id) => !removedMovies.has(id));

  // Fetch movie details - use dependency on displayedRatings length and join to avoid infinite loops
  useEffect(() => {
    if (displayedRatings.length) {
      fetchMoviesByIds(displayedRatings);
    }
  }, [displayedRatings.length, displayedRatings.join(",")]);

  // Get movies with full details
  const ratedMovies = useMemo(() => {
    return displayedRatings
      .map((id) => moviesState.fetchedMoviesById.get(id))
      .filter((movie): movie is Movie => movie !== undefined);
  }, [displayedRatings.join(","), moviesState.fetchedMoviesById]);

  // Apply filters
  const filteredMovies = useMemo(() => {
    return ratedMovies.filter((movie) => {
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
  }, [ratedMovies, filters]);

  // Apply sorting
  const sortedMovies = useMemo(() => {
    const sorted = [...filteredMovies].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "movieRating":
          comparison = a.vote_average - b.vote_average;
          break;
        case "userRating": {
          const ratingA =
            user?.ratings.find((r) => r.movie_id === a.id)?.rating || 0;
          const ratingB =
            user?.ratings.find((r) => r.movie_id === b.id)?.rating || 0;
          comparison = ratingA - ratingB;
          break;
        }
        case "year":
          const yearA = new Date(a.release_date).getFullYear();
          const yearB = new Date(b.release_date).getFullYear();
          comparison = yearA - yearB;
          break;
        case "dateRated":
        default:
          const indexA = ratedMovieIds.indexOf(a.id);
          const indexB = ratedMovieIds.indexOf(b.id);
          comparison = indexA - indexB;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredMovies, sortBy, sortOrder, ratedMovieIds, user?.ratings]);

  const handleMovieRemoved = (movieId: number) => {
    setRemovedMovies((prev) => new Set([...prev, movieId]));
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

  const averageRating = useMemo(() => {
    if (!user?.ratings.length) return 0;
    const total = user.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return total / user.ratings.length;
  }, [user?.ratings]);

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
                    <Star className="w-5 h-5 text-primary fill-current" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      Your Ratings
                    </h1>
                    <div className="flex items-center gap-4 text-secondary">
                      <span>
                        {sortedMovies.length} of {displayedRatings.length} movie
                        {displayedRatings.length !== 1 ? "s" : ""} rated
                        {activeFiltersCount > 0 && " (filtered)"}
                      </span>
                      {user?.ratings.length && (
                        <>
                          <span>•</span>
                          <span>Average: {averageRating.toFixed(1)}/10</span>
                        </>
                      )}
                    </div>
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
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dateRated">Date Rated</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="userRating">Your Rating</SelectItem>
                      <SelectItem value="movieRating">Movie Rating</SelectItem>
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

                {displayedRatings.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary px-3 py-1"
                  >
                    {displayedRatings.length} rating
                    {displayedRatings.length !== 1 ? "s" : ""}
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

            {/* Ratings Content */}
            <AnimatePresence mode="popLayout">
              {displayedRatings.length === 0 ? (
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
                        <Star className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No Rated Movies Yet
                      </h3>
                      <p className="text-secondary text-center mb-6 max-w-md">
                        Start rating movies you've watched to build your
                        personal rating collection. Browse movies and rate them
                        to add them here.
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
                <motion.div key="ratings-list" className="space-y-4" layout>
                  {sortedMovies.map((movie) => (
                    <RatingMovieCard
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
