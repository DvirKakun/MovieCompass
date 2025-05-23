import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface MovieRatingProps {
  initialRating?: number;
}

export default function MovieRating({ initialRating = 0 }: MovieRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(initialRating > 0);

  const handleRating = (selectedRating: number) => {
    // If clicking on the same rating, clear it
    if (selectedRating === rating && hasRated) {
      setRating(0);
      setHasRated(false);
    } else {
      setRating(selectedRating);
      setHasRated(true);
    }

    // In a real app, you would send this rating to your backend
    // saveRating(movieId, selectedRating);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-foreground">Rate this movie</h3>

      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <motion.button
            key={star}
            className="relative p-1 focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          >
            <Star
              className={`w-6 h-6 transition-colors duration-100 ${
                (hoveredRating ? star <= hoveredRating : star <= rating)
                  ? "text-rating fill-rating"
                  : "text-muted-foreground"
              }`}
            />
          </motion.button>
        ))}

        <span className="ml-2 text-secondary">
          {hasRated ? (
            <motion.span
              key={rating}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-medium"
            >
              {rating}/10
            </motion.span>
          ) : hoveredRating > 0 ? (
            <span className="text-muted-foreground">{hoveredRating}/10</span>
          ) : (
            <span className="text-muted-foreground">Rate</span>
          )}
        </span>
      </div>

      {hasRated && (
        <motion.p
          className="text-sm text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Thanks for rating!
        </motion.p>
      )}
    </div>
  );
}
