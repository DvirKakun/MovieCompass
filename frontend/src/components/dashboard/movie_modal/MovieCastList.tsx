import { useEffect } from "react";
import { AlertCircle, User } from "lucide-react";
import { Skeleton } from "../../ui/skeleton";
import { motion } from "framer-motion";
import { useMovies } from "../../../contexts/MoviesContext";

interface MovieCastListProps {
  movieId: number;
}

export default function MovieCastList({ movieId }: MovieCastListProps) {
  const { fetchMovieCast, getCast, isCastLoading, castError } = useMovies();
  const cast = getCast(movieId);
  const isLoading = isCastLoading(movieId);
  const error = castError(movieId);

  useEffect(() => {
    console.log("CAST");
    fetchMovieCast(movieId);
  }, [movieId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-6">
        <div className="flex flex-col items-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-destructive font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (cast.length === 0) {
    return (
      <div className="text-center py-6 text-secondary">
        <p>No cast information available</p>
      </div>
    );
  }

  // Cast list
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {cast.map((person, index) => (
        <motion.div
          key={person.id}
          className="flex flex-col items-center text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted">
            {person.profile_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <User className="w-8 h-8 text-secondary/50" />
              </div>
            )}
          </div>
          <p
            className="font-medium text-sm text-foreground line-clamp-1"
            title={person.name}
          >
            {person.name}
          </p>
          <p
            className="text-xs text-secondary line-clamp-1"
            title={person.character}
          >
            {person.character}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
