import { useState } from "react";
import { Star, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUserActions } from "../../../contexts/UserContext";
import { Button } from "../../ui/button";

interface MovieRatingProps {
  movieId: number;
}

export default function MovieRating({ movieId }: MovieRatingProps) {
  const { getUserRating, setMovieRating, removeMovieRating, isRatingLoading } =
    useUserActions();

  const currentRating = getUserRating(movieId);
  const [hoveredRating, setHoveredRating] = useState(0);
  const isLoading = isRatingLoading(movieId);

  const handleRating = async (selectedRating: number) => {
    if (isLoading) return;

    // If clicking on the same rating, don't clear it - that's what the remove button is for
    await setMovieRating(movieId, selectedRating);
  };

  const handleRemoveRating = async () => {
    if (isLoading) return;

    await removeMovieRating(movieId);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Rate this movie</h3>
        {currentRating && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveRating}
            disabled={isLoading}
            className="text-muted-foreground hover:text-destructive h-auto p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <motion.button
            key={star}
            className={`relative p-1 focus:outline-none ${
              isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
            whileHover={!isLoading ? { scale: 1.1 } : {}}
            whileTap={!isLoading ? { scale: 0.9 } : {}}
            onClick={() => handleRating(star)}
            onMouseEnter={() => !isLoading && setHoveredRating(star)}
            onMouseLeave={() => !isLoading && setHoveredRating(0)}
            disabled={isLoading}
          >
            <Star
              className={`w-6 h-6 transition-colors duration-100 ${
                (
                  hoveredRating
                    ? star <= hoveredRating
                    : star <= (currentRating || 0)
                )
                  ? "text-rating fill-rating"
                  : "text-muted-foreground"
              }`}
            />
          </motion.button>
        ))}

        <span className="ml-2 text-secondary">
          {isLoading ? (
            <span className="text-muted-foreground">Saving...</span>
          ) : currentRating ? (
            <motion.span
              key={currentRating}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-medium"
            >
              {currentRating}/10
            </motion.span>
          ) : hoveredRating > 0 ? (
            <span className="text-muted-foreground">{hoveredRating}/10</span>
          ) : (
            <span className="text-muted-foreground">Rate</span>
          )}
        </span>
      </div>

      {currentRating && !isLoading && (
        <motion.p
          className="text-sm text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          You rated this movie {currentRating}/10
        </motion.p>
      )}
    </div>
  );
}
