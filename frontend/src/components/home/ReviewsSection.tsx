import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import ReviewCard from "../reviews/ReviewCard";
import ReviewStats from "../reviews/ReviewStats";
import FloatingReviewCards from "../reviews/FloatingReviewCard";

export default function ReviewsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: true }}
      className="mt-32"
    >
      <div className="bg-gradient-to-br from-card via-card to-muted rounded-2xl p-8 md:p-12 border border-border shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-brand" />
              <h3 className="text-3xl font-heading font-bold text-primary">
                Community Reviews
              </h3>
            </div>

            <p className="text-lg text-secondary leading-relaxed">
              Read honest reviews from fellow movie lovers and share your own
              thoughts. Our community-driven review system helps you make
              informed decisions about what to watch next.
            </p>

            <ReviewStats />
          </div>

          {/* Right Column - Review Card with Floating Elements */}
          <div className="relative">
            <ReviewCard />
            <FloatingReviewCards />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
