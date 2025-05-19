import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function ReviewCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-background rounded-xl p-6 border border-border shadow-xl"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-background font-bold text-lg">
          MR
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-primary">Movie Reviewer</span>
            <div className="flex text-rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-secondary text-sm">
            "Absolutely incredible platform! The AI recommendations are spot-on
            and I've discovered so many amazing films I never would have found
            otherwise."
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Reviewed: The Matrix Resurrections</span>
        <span>2 days ago</span>
      </div>
    </motion.div>
  );
}
