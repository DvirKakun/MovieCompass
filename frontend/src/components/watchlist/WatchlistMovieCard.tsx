import { useMovieModal } from "../../contexts/MovieModalContext";
import { useMovies } from "../../contexts/MoviesContext";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { Calendar, Play, Star, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useUserActions } from "../../contexts/UserContext";
import { useState } from "react";

interface WatchlistMovieCardProps {
  movieId: number;
  onRemove: () => void;
}

export default function WatchlistMovieCard({
  movieId,
  onRemove,
}: WatchlistMovieCardProps) {
  const { openModal } = useMovieModal();
  const { toggleToWatchlist } = useUserActions();
  // const { listLoading } = useUserState();
  const { getMovieById } = useMovies();
  const [imageError, setImageError] = useState(false);
  const movie = getMovieById(movieId)!;

  // const isRemoving = listLoading.watchlist.has(movieId);

  const handleRemove = () => {
    toggleToWatchlist(movieId);
    // await removeFromWatchlist(movieId);
    onRemove?.();
  };

  const handleOpenModal = () => {
    openModal(movie);
  };

  if (!movie) {
    return (
      <Card className="bg-card border-border animate-pulse">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-24 h-36 bg-muted rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";
  const genres = movie.genres?.slice(0, 3).map((genre) => genre.name) || [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border-border hover:bg-card/80 transition-all duration-300 group">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Movie Poster */}
            <div className="relative w-24 h-36 flex-shrink-0">
              {!imageError && movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded-lg cursor-pointer"
                  onClick={handleOpenModal}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className="w-full h-full bg-muted rounded-lg flex items-center justify-center cursor-pointer"
                  onClick={handleOpenModal}
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}

              {/* Rating Badge */}
              <div className="absolute top-2 right-2">
                <Badge
                  variant="secondary"
                  className="bg-black/80 text-white border-0 font-medium text-xs px-2 py-1"
                >
                  <Star className="w-3 h-3 mr-1 text-rating fill-current" />
                  {movie.vote_average.toFixed(1)}
                </Badge>
              </div>
            </div>

            {/* Movie Details */}
            <div className="flex-1 min-w-0">
              <div className="space-y-3">
                {/* Title and Year */}
                <div>
                  <h3
                    className="font-bold text-foreground text-lg leading-tight mb-1 group-hover:text-primary transition-colors cursor-pointer"
                    onClick={handleOpenModal}
                    title={movie.title}
                  >
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-secondary mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{releaseYear}</span>
                    {genres.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{genres.join(", ")}</span>
                      </>
                    )}
                  </div>

                  {/* Movie Rating */}
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-rating fill-current" />
                    <span className="text-foreground font-medium">
                      {movie.vote_average.toFixed(1)}
                    </span>
                    <span className="text-secondary">
                      ({movie.vote_count.toLocaleString()} votes)
                    </span>
                  </div>
                </div>

                {/* Overview */}
                <p className="text-secondary text-sm leading-relaxed line-clamp-3">
                  {movie.overview || "No overview available."}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleOpenModal}
                    className="bg-primary hover:bg-cta_hover text-background"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    View Details
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    // disabled={isRemoving}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                  >
                    <Trash2 className="w-4 h-4 fill" />

                    {/* {isRemoving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 fill" />
                    )}
                    {isRemoving ? "Removing..." : "Remove"} */}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
