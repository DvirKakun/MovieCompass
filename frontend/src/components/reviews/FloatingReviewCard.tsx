import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function FloatingReviewCards() {
  return (
    <>
      {/* Floating rating card */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-4 -right-4 bg-card rounded-lg p-3 shadow-lg border border-border hidden lg:block"
      >
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-rating fill-current" />
          <span className="text-sm font-semibold">9.1/10</span>
        </div>
      </motion.div>

      {/* Floating latest review card */}
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute -bottom-4 -left-4 bg-card rounded-lg p-3 shadow-lg border border-border hidden lg:block"
      >
        <div className="text-xs text-secondary">
          <div className="font-semibold">Latest Review</div>
          <div className="text-brand">Just now</div>
        </div>
      </motion.div>
    </>
  );
}
