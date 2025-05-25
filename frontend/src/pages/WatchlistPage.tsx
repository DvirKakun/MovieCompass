import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bookmark } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import WatchlistMovieCard from "../components/watchlist/WatchlistMovieCard";
import { useMovieModal } from "../contexts/MovieModalContext";
import MovieDetailModal from "../components/dashboard/movie_modal/MovieDetailModal";
import { useUserState } from "../contexts/UserContext";
import { useMovies } from "../contexts/MoviesContext";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { user } = useUserState();
  const { isOpen, selectedMovie, closeModal } = useMovieModal();
  const [removedMovies, setRemovedMovies] = useState<Set<number>>(new Set());
  const { fetchMoviesByIds, state: moviesState } = useMovies();
  const watchlistIds = user?.watchlist || [];

  const displayedWatchlist = watchlistIds.filter(
    (id) => !removedMovies.has(id)
  );

  useEffect(() => {
    if (displayedWatchlist.length) {
      fetchMoviesByIds(displayedWatchlist);
    }
  }, [displayedWatchlist, fetchMoviesByIds]);

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
                      {displayedWatchlist.length} movie
                      {displayedWatchlist.length !== 1 ? "s" : ""} saved to
                      watch later
                    </p>
                  </div>
                </div>
              </div>

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
              ) : (
                <motion.div key="watchlist-grid" className="space-y-4" layout>
                  {displayedWatchlist.map((movieId) => (
                    <WatchlistMovieCard
                      key={movieId}
                      movieId={movieId}
                      onRemove={() => handleMovieRemoved(movieId)}
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
      {selectedMovie && (
        <MovieDetailModal
          isOpen={isOpen}
          onClose={closeModal}
          movie={selectedMovie}
        />
      )}
    </>
  );
}
