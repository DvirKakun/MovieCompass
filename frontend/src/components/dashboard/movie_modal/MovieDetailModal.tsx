import { useState, useEffect, memo } from "react";
import {
  Star,
  Calendar,
  Film,
  Plus,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useMovies } from "../../../contexts/MoviesContext";
import MovieCastList from "./MovieCastList";
import MovieRating from "./MovieRating";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import MovieReviewsList from "./MovieReviewsList";
import { useUserActions, useUserState } from "../../../contexts/UserContext";
import {
  useMovieModalActions,
  useMovieModalState,
} from "../../../contexts/MovieModalContext";

export default memo(function MovieDetailModal() {
  const { getGenreName } = useMovies();
  const { isOpen, selectedMovie: movie } = useMovieModalState();
  const {
    closeModal,
    fetchMovieTrailer,
    getTrailer,
    isTrailerLoading,
    getTrailerError,
  } = useMovieModalActions();
  const movieId = movie?.id!;
  const { toggleToFavorite, toggleToWatchlist, getUserRating } =
    useUserActions();
  const {
    listLoading: { watchlist: wlLoad, favoriteMovies: favLoad },
    user,
  } = useUserState();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isInFavorites, setIsInFavorites] = useState(false);
  const trailer = movieId ? getTrailer(movieId) : undefined;
  const isLoadingTrailer = movieId ? isTrailerLoading(movieId) : false;
  const trailerErr = movieId ? getTrailerError(movieId) : null;
  const userRating = getUserRating(movieId);

  const isWLBusy = wlLoad.has(movieId);
  const isFavBusy = favLoad.has(movieId);

  // Fetch trailer when movie changes
  useEffect(() => {
    console.log("TRAILER");
    if (isOpen) fetchMovieTrailer(movieId);
  }, [isOpen, movieId]);

  // Check if movie is in watchlist/favorites (would connect to your user context)
  useEffect(() => {
    if (!movieId || !user) return;

    const inWatchlist = user.watchlist.some(
      (movie_id: number) => movie_id === movieId
    );
    const inFavorites = user.favoriteMovies.some(
      (movie_id: number) => movie_id === movieId
    );

    setIsInWatchlist(inWatchlist);
    setIsInFavorites(inFavorites);
  }, [movieId, user]);

  const handleToggleToWatchlist = () => toggleToWatchlist(movieId);
  const handleAddToFavorites = () => toggleToFavorite(movieId);

  // Get genres for display
  const genres = movie?.genre_ids
    ? movie?.genre_ids.slice(0, 3).map((id) => getGenreName(id))
    : movie?.genres?.slice(0, 3).map((genre) => genre.name) || [];
  const releaseYear = movie?.release_date
    ? new Date(movie?.release_date).getFullYear()
    : null;

  // If we don't have a movie yet, show a loading state
  if (!movie && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-2xl bg-card border-border p-0 overflow-hidden">
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] bg-card border-border p-0 overflow-hidden rounded-lg">
        <div className="flex flex-col h-full max-h-[90vh] overflow-y-auto scrollbar-container">
          <DialogHeader className="sr-only">
            <DialogTitle>{movie?.title ?? "Movie Details"}</DialogTitle>
            <DialogDescription>
              Full details, trailer and cast for the selected movie.
            </DialogDescription>
          </DialogHeader>
          {movie && (
            <div className="flex flex-col h-full">
              {/* Trailer section */}
              <div className="relative h-[24rem] bg-muted overflow-hidden flex-shrink-0">
                {isLoadingTrailer ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                ) : trailer && trailer.embed_url ? (
                  <iframe
                    src={trailer.embed_url}
                    title={`${movie.title} - ${trailer.title}`}
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-background/40 to-background/90">
                    <Film className="w-16 h-16 text-primary/30 mb-4" />

                    {trailerErr ? (
                      <div className="flex flex-col items-center text-center">
                        <AlertTriangle className="w-8 h-8 text-destructive/70 mb-2" />
                        <p className="text-destructive text-lg font-medium">
                          {trailerErr}
                        </p>
                      </div>
                    ) : (
                      <p className="text-secondary text-lg">
                        Trailer not available
                      </p>
                    )}

                    {/* Fallback to backdrop or poster image */}
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                        alt={movie.title}
                        className="absolute inset-0 w-full h-full object-cover blur-sm -z-10 opacity-30"
                      />
                    ) : null}
                  </div>
                )}
              </div>

              {/* Movie info section */}
              <div className="p-4 space-y-4 overflow-y-auto flex-grow scrollbar-container">
                {/* Title and metadata */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-4">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {movie.title}
                    </h2>

                    {/* Year and Genres */}
                    <div className="flex items-center gap-2 text-sm text-secondary mb-3">
                      {releaseYear && (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span>{releaseYear}</span>
                        </>
                      )}
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
                      {movie.vote_average > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-rating fill-current" />
                          <span className="text-foreground font-medium">
                            {movie.vote_average.toFixed(1)}
                          </span>
                          <span className="text-secondary">
                            ({movie.vote_count.toLocaleString()} votes)
                          </span>
                        </div>
                      )}

                      {/* User Rating */}
                      {userRating && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-primary fill-current" />
                            <span className="text-primary font-medium">
                              Your rating: {userRating}/10
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isWLBusy}
                      className={`flex items-center ${
                        isInWatchlist
                          ? "border-primary text-primary"
                          : "border-border text-secondary"
                      }`}
                      onClick={handleToggleToWatchlist}
                    >
                      {isWLBusy ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : isInWatchlist ? (
                        <Check className="w-4 h-4 mr-1" />
                      ) : (
                        <Plus className="w-4 h-4 mr-1" />
                      )}
                      Watchlist
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isFavBusy}
                      className={`flex items-center ${
                        isInFavorites
                          ? "border-primary text-primary"
                          : "border-border text-secondary"
                      }`}
                      onClick={handleAddToFavorites}
                    >
                      {isFavBusy ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : isInFavorites ? (
                        <Check className="w-4 h-4 mr-1" />
                      ) : (
                        <Plus className="w-4 h-4 mr-1" />
                      )}
                      Favorite
                    </Button>
                  </div>
                </div>

                {/* Overview */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Overview
                  </h3>
                  <p className="text-secondary leading-relaxed">
                    {movie.overview || "No overview available."}
                  </p>
                </div>

                {/* Rating component */}
                <MovieRating movieId={movie.id} />

                {/* Cast section */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    Cast
                  </h3>
                  <MovieCastList movieId={movie.id} />
                </div>

                {/*Reviews section*/}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    Reviews
                  </h3>
                  <MovieReviewsList movieId={movie.id} />
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
