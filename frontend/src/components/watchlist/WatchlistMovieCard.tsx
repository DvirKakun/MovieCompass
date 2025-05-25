import { useEffect, useState } from "react";
import { useMovieModal } from "../../contexts/MovieModalContext";
import { useMovies } from "../../contexts/MoviesContext";
import { Card, CardContent } from "../ui/card";
import { motion } from "framer-motion";
import { Calendar, Play, Star, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useUserActions, useUserState } from "../../contexts/UserContext";

interface WatchlistMovieCardProps {
  movieId: number;
  onRemove: () => void;
}

export default function WatchlistMovieCard({
  movieId,
  onRemove,
}: WatchlistMovieCardProps) {
  const { openModal } = useMovieModal();
  const [movie, setMovie] = useState<any>(null);
  const { state: moviesState } = useMovies();
  const { removeFromWatchlist } = useUserActions();
  const { listLoading } = useUserState();

  const isRemoving = listLoading.watchlist.has(movieId);

  // Find movie in all available sources
  useEffect(() => {
    // Search in popular movies
    const popularMovie = moviesState.popularMovies.find(
      (m) => m.id === movieId
    );
    if (popularMovie) {
      setMovie(popularMovie);
      return;
    }

    // Search in genre movies
    for (const [_, movies] of moviesState.moviesByGenre) {
      const foundMovie = movies.find((movie) => movie.id === movieId);

      if (foundMovie) {
        setMovie(foundMovie);

        return;
      }
    }

    // Search in search results
    const searchMovie = moviesState.searchResults.find(
      (movie) => movie.id === movieId
    );
    if (searchMovie) {
      setMovie(searchMovie);

      return;
    }
  }, [movieId, moviesState]);

  const handleRemove = async () => {
    await removeFromWatchlist(movieId);
    onRemove();
  };

  if (!movie) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex animate-pulse">
            <div className="w-24 h-36 bg-muted" />
            <div className="flex-1 p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-0">
          <div className="flex">
            {/* Movie Poster */}
            <div className="relative w-24 h-36 flex-shrink-0">
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openModal(movie)}
                />
              ) : (
                <div
                  className="w-full h-full bg-muted flex items-center justify-center cursor-pointer"
                  onClick={() => openModal(movie)}
                >
                  <Star className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="flex-1 p-4 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <h3
                  className="font-semibold text-foreground line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => openModal(movie)}
                  title={movie.title}
                >
                  {movie.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isRemoving}
                  onClick={handleRemove}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-secondary mb-3">
                {releaseYear && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{releaseYear}</span>
                  </div>
                )}
                {movie.vote_average > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-rating" />
                    <span>{rating}</span>
                  </div>
                )}
              </div>

              <p className="text-secondary text-sm line-clamp-2 mb-3">
                {movie.overview || "No overview available."}
              </p>

              <Button
                size="sm"
                onClick={() => openModal(movie)}
                className="bg-primary hover:bg-cta_hover"
              >
                <Play className="w-3 h-3 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
