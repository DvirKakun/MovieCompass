import { useCallback, useEffect, useState } from "react";
import { User, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { motion } from "framer-motion";
import { useMovies } from "../../../contexts/MoviesContext";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";

interface MovieReviewsListProps {
  movieId: number;
}

export default function MovieReviewsList({ movieId }: MovieReviewsListProps) {
  const { state, fetchReviewPage } = useMovies();
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(
    new Set()
  );

  // Get reviews data for this movie
  const reviews = state.reviews.get(movieId) ?? [];
  const isLoading = state.reviewsLoading.get(movieId) ?? false;
  const error = state.reviewsError.get(movieId) ?? null;
  const hasMore = state.reviewHasMore.get(movieId) ?? true;

  // Fetch function for infinite scroll
  const fetchNextPage = useCallback(async () => {
    await fetchReviewPage(movieId);
  }, [movieId, fetchReviewPage]);

  // Use infinite scroll hook
  const { sentinelRef, isFetching } = useInfiniteScroll({
    fetchFn: fetchNextPage,
    hasMore,
    isLoading,
    rootMargin: "400px",
  });

  // Initial fetch when component mounts
  useEffect(() => {
    if (reviews.length === 0 && !isLoading && !error) {
      fetchReviewPage(movieId, 1);
    }
  }, [movieId, reviews.length, isLoading, error, fetchReviewPage]);

  // Loading state for initial fetch
  if (isLoading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-muted/30 border-border animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-4 w-16 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error && reviews.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="flex flex-col items-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-destructive font-medium">Failed to load reviews</p>
          <p className="text-secondary text-sm">{error}</p>
          <button
            onClick={() => fetchReviewPage(movieId, 1)}
            className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-cta_hover transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-secondary font-medium">No reviews available</p>
        <p className="text-muted-foreground text-sm mt-1">
          No user reviews found for this movie
        </p>
      </div>
    );
  }

  // Helper function to check if content needs truncation
  const needsTruncation = (content: string, maxLength: number = 300) => {
    return content.length > maxLength;
  };

  // Helper function to get display content
  const getDisplayContent = (review: any, maxLength: number = 300) => {
    const isExpanded = expandedReviews.has(review.id);
    if (isExpanded || !needsTruncation(review.content, maxLength)) {
      return review.content;
    }
    return review.content.substring(0, maxLength) + "...";
  };

  // Toggle expand/collapse for a review
  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Reviews List */}
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="bg-muted/30 border-border hover:bg-muted/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                {/* Author Avatar - Simple initial-based avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium text-sm">
                    {review.author.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  {/* Author Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-foreground text-sm truncate">
                      {review.author}
                    </span>
                    {review.created_at && (
                      <div className="flex items-center text-xs text-secondary flex-shrink-0">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(review.created_at)}
                      </div>
                    )}
                  </div>

                  {/* Review Text */}
                  <div className="space-y-2">
                    <p className="text-secondary text-sm leading-relaxed">
                      {getDisplayContent(review)}
                    </p>

                    {needsTruncation(review.content) && (
                      <button
                        onClick={() => toggleExpanded(review.id)}
                        className="text-primary text-xs font-medium hover:text-cta_hover transition-colors focus:outline-none"
                      >
                        {expandedReviews.has(review.id)
                          ? "Show less"
                          : "Read more"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Loading More Indicator */}
      {isFetching && (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-secondary text-sm">Loading more reviews...</p>
          </div>
        </div>
      )}

      {/* Show total count if we have reviews */}
      {reviews.length > 0 && !hasMore && (
        <div className="text-center py-4">
          <p className="text-xs text-secondary">
            Showing all {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      {hasMore && <div ref={sentinelRef} className="h-1" />}
    </div>
  );
}
