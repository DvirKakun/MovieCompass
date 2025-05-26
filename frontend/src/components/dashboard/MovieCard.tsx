import { memo } from "react";
import {
  Star,
  Calendar,
  Heart,
  Bookmark,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import type { Movie } from "../../types/movies";
import { useMovieModal } from "../../contexts/MovieModalContext";
import MoviePlaceholder from "./MoviePlaceholder";
import { Button } from "../ui/button";
import { useUserActions, useUserState } from "../../contexts/UserContext";

interface MovieCardProps {
  movie: Movie | { id: number; title: string; placeholder?: boolean };
}

export default memo(function MovieCard({ movie }: MovieCardProps) {
  console.log(movie.id);
  const movieId = movie.id;
  const { openModal } = useMovieModal();
  const { toggleToFavorite, toggleToWatchlist } = useUserActions();
  const { user, listLoading } = useUserState();

  // Check if this is a placeholder card
  const isPlaceholder = "placeholder" in movie && movie.placeholder;

  const isWLBusy = listLoading.watchlist.has(movieId);
  const isFavBusy = listLoading.favoriteMovies.has(movieId);

  const isInWatchlist = user?.watchlist.includes(movieId);

  const isInFavorites = user?.favoriteMovies.includes(movieId);

  const handleToggleToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleToWatchlist(movieId);
  };

  const handleAddToFavorites = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleToFavorite(movieId);
  };

  if (isPlaceholder) {
    return <MoviePlaceholder />;
  }

  // Real movie card (when movie data is available)
  const realMovie = movie as Movie;
  const releaseYear = realMovie.release_date
    ? new Date(realMovie.release_date).getFullYear()
    : "";
  const rating = realMovie.vote_average
    ? realMovie.vote_average.toFixed(1)
    : "N/A";

  return (
    <div onClick={() => openModal(realMovie)} className="w-48 flex-none">
      {/* Movie Poster */}
      <div className="relative group cursor-pointer">
        <div className="w-48 h-72 bg-muted rounded-lg border border-border overflow-hidden">
          {realMovie.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${realMovie.poster_path}`}
              alt={realMovie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-border rounded-full mx-auto flex items-center justify-center">
                  <Star className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No Image</p>
              </div>
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300 rounded-lg flex items-center justify-center"
        >
          <div className="text-center space-y-3">
            <Button
              className="bg-primary text-background hover:bg-cta_hover transition-colors"
              onClick={() => openModal(realMovie)}
            >
              View Details
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={isWLBusy}
                className={`flex items-center ${
                  isInWatchlist
                    ? "bg-primary/20 text-primary border-primary"
                    : "bg-card text-foreground hover:bg-muted"
                } transition-colors`}
                onClick={handleToggleToWatchlist}
              >
                {isWLBusy ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : isInWatchlist ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Plus className="w-3 h-3 mr-1" />
                )}
                <Bookmark className="w-3 h-3" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={isFavBusy}
                className={`flex items-center ${
                  isInFavorites
                    ? "bg-primary/20 text-primary border-primary"
                    : "bg-card text-foreground hover:bg-muted"
                } transition-colors`}
                onClick={handleAddToFavorites}
              >
                {isFavBusy ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : isInFavorites ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Plus className="w-3 h-3 mr-1" />
                )}
                <Heart
                  className={`w-3 h-3 ${isInFavorites ? "fill-current" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        {realMovie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/80 text-rating px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
            <Star className="w-3 h-3 fill-current" />
            <span>{rating}</span>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="mt-3 space-y-1">
        <h3
          className="text-foreground font-medium text-sm leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors"
          title={realMovie.title}
          onClick={() => openModal(realMovie)}
        >
          {realMovie.title}
        </h3>
        <div className="flex items-center space-x-3 text-secondary text-xs">
          {releaseYear && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{releaseYear}</span>
            </div>
          )}
          {realMovie.vote_average > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>{rating}</span>
            </div>
          )}
          {realMovie.vote_count > 0 && (
            <div className="flex items-center space-x-1">
              <span>({realMovie.vote_count})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
