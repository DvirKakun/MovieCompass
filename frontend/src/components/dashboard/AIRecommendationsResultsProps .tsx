import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import MovieCard from "./MovieCard";
import { useUserState, useUserActions } from "../../contexts/UserContext";

interface AIRecommendationsResultsProps {
  onBack: () => void;
}

export default function AIRecommendationsResults({
  onBack,
}: AIRecommendationsResultsProps) {
  const {
    aiRecommendations,
    aiRecommendationsLoading,
    aiRecommendationsError,
  } = useUserState();
  const { fetchAIRecommendations } = useUserActions();

  // Fetch AI recommendations on component mount if not already loaded
  useEffect(() => {
    if (
      aiRecommendations.length === 0 &&
      !aiRecommendationsLoading &&
      !aiRecommendationsError
    ) {
      fetchAIRecommendations();
    }
  }, []);

  const handleRetry = () => {
    fetchAIRecommendations();
  };

  // Loading state
  if (aiRecommendationsLoading) {
    return (
      <div className="space-y-6">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                AI Recommendations
              </h2>
              <p className="text-secondary mt-1">
                Getting personalized recommendations based on your taste...
              </p>
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <Sparkles className="w-16 h-16 text-primary" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Analyzing Your Movie Preferences
              </h3>
              <div className="text-center space-y-2 max-w-md">
                <p className="text-secondary">
                  Our AI is analyzing your ratings, favorites, and watchlist to
                  find movies perfectly tailored to your taste.
                </p>
                <p className="text-primary text-sm font-medium">
                  This usually takes 4-5 minutes. Please be patient...
                </p>
              </div>
              <div className="mt-8 flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-secondary text-sm">
                  Processing recommendations...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (aiRecommendationsError) {
    return (
      <div className="space-y-6">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                AI Recommendations
              </h2>
              <p className="text-secondary mt-1">
                Unable to generate recommendations
              </p>
            </div>
          </div>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Recommendation Failed
              </h3>
              <div className="text-center space-y-2 max-w-md mb-6">
                <p className="text-secondary">{aiRecommendationsError}</p>
                <p className="text-muted-foreground text-sm">
                  This might be due to insufficient data or a temporary server
                  issue.
                </p>
              </div>
              <Button
                onClick={handleRetry}
                className="bg-primary hover:bg-cta_hover text-background"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Empty state (no recommendations)
  if (aiRecommendations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                AI Recommendations
              </h2>
              <p className="text-secondary mt-1">
                No recommendations available
              </p>
            </div>
          </div>

          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                No Recommendations Yet
              </h3>
              <div className="text-center space-y-2 max-w-md mb-6">
                <p className="text-secondary">
                  To get personalized AI recommendations, try rating more movies
                  or adding films to your favorites.
                </p>
                <p className="text-muted-foreground text-sm">
                  The more you interact with movies, the better our AI can
                  understand your preferences.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleRetry}
                  className="bg-primary hover:bg-cta_hover text-background"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="border-primary text-primary hover:bg-primary hover:text-background"
                >
                  Browse Movies
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state with recommendations
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 p-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                AI Recommendations
              </h2>
              <p className="text-secondary mt-1">
                {aiRecommendations.length} personalized movie
                {aiRecommendations.length !== 1 ? "s" : ""} just for you
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleRetry}
            className="border-primary text-primary hover:bg-primary hover:text-background"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Get New Recommendations
          </Button>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {aiRecommendations.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
