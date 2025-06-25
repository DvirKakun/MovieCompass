import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Calendar,
  Star,
  Image as ImageIcon,
  Edit3,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useMovies } from "../../contexts/MoviesContext";
import { useUserActions } from "../../contexts/UserContext";
import { useMovieModal } from "../../contexts/MovieModalContext";
import MovieRating from "../dashboard/movie_modal/MovieRating";

interface RatingMovieCardProps {
  movieId: number;
  onRemove?: () => void;
}

export default function RatingMovieCard({
  movieId,
  onRemove,
}: RatingMovieCardProps) {
  const { getMovieById } = useMovies();
  const { removeMovieRating, getUserRating } = useUserActions();
  const { openModal } = useMovieModal();
  const [imageError, setImageError] = useState(false);
  const [showRatingEditor, setShowRatingEditor] = useState(false);
  // const [isRemovingRating, setIsRemoving] = useState(false);

  const movie = getMovieById(movieId);
  const userRating = getUserRating(movieId);
  // const isRemoving = isRatingLoading(movieId);

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

  const handleRemoveRating = () => {
    if (!userRating) return;

    removeMovieRating(movieId);
    onRemove?.();

    // setIsRemoving(true);
    // try {
    //   await removeMovieRating(movieId);
    //   onRemove?.();
    // } finally {
    //   setIsRemoving(false);
    // }
  };

  const handleOpenModal = () => {
    openModal(movie);
  };

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

              {/* Movie Rating Badge */}
              <div className="absolute top-2 right-2">
                <Badge
                  variant="secondary"
                  className="bg-black/80 text-white border-0 font-medium text-xs px-2 py-1"
                >
                  <Star className="w-3 h-3 mr-1 text-rating fill-current" />
                  {movie.vote_average.toFixed(1)}
                </Badge>
              </div>

              {/* User Rating Badge */}
              {userRating && (
                <div className="absolute bottom-2 right-2">
                  <Badge
                    variant="default"
                    className="bg-primary text-background border-0 font-bold text-xs px-2 py-1"
                  >
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {userRating}/10
                  </Badge>
                </div>
              )}
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

                  {/* Ratings Row */}
                  <div className="flex items-center gap-4 text-sm">
                    {/* Movie Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-rating fill-current" />
                      <span className="text-foreground font-medium">
                        {movie.vote_average.toFixed(1)}
                      </span>
                      <span className="text-secondary">
                        ({movie.vote_count.toLocaleString()} votes)
                      </span>
                    </div>

                    {/* User Rating */}
                    {userRating && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-primary fill-current" />
                          <span className="text-primary font-bold">
                            Your rating: {userRating}/10
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Overview */}
                <p className="text-secondary text-sm leading-relaxed line-clamp-3">
                  {movie.overview || "No overview available."}
                </p>

                {/* Rating Editor Section */}
                {showRatingEditor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-border pt-3"
                  >
                    <MovieRating movieId={movieId} />
                  </motion.div>
                )}

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
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRatingEditor(!showRatingEditor)}
                    className="border-primary text-primary hover:bg-primary hover:text-background"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {showRatingEditor ? "Hide Rating" : "Edit Rating"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveRating}
                    // disabled={isRemovingRating}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                  >
                    <Trash2 className="w-4 h-4 fill" />

                    {/* {isRemovingRating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 fill" />
                    )}
                    {isRemovingRating ? "Removing..." : "Remove"} */}
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
