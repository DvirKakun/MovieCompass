import { motion } from "framer-motion";
import { Film, Sparkles, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useMovies } from "../../contexts/MoviesContext";
import { useUser } from "../../contexts/UserContext";

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (genreId: number | null, genreName: string) => void;
  onAIRecommendations: () => void;
}

export default function CategorySidebar({
  isOpen,
  onClose,
  onCategorySelect,
  onAIRecommendations,
}: CategorySidebarProps) {
  const { state } = useMovies();
  const { state: userState } = useUser();
  const { genres } = state;
  const user = userState.user;

  const hasFavorites = user?.favoriteMovies && user.favoriteMovies.length > 0;

  const handleCategoryClick = (genreId: number | null, genreName: string) => {
    onCategorySelect(genreId, genreName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Browse Movies</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* AI Recommendations */}
          {hasFavorites && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-secondary mb-3">
                  Get personalized recommendations based on your favorite movies
                </p>
                <Button
                  onClick={() => {
                    onAIRecommendations();
                    onClose();
                  }}
                  className="w-full bg-primary hover:bg-cta_hover"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Recommendations
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Popular Movies */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
              Featured
            </h3>
            <Button
              variant="ghost"
              onClick={() => handleCategoryClick(null, "Popular Movies")}
              className="w-full justify-start h-auto p-3 text-left hover:bg-primary/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Film className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Popular Movies</p>
                  <p className="text-xs text-secondary">Trending now</p>
                </div>
              </div>
            </Button>
          </div>

          <Separator />

          {/* Genres */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
                Genres
              </h3>
              <Badge variant="secondary" className="text-xs">
                {genres.length}
              </Badge>
            </div>

            <div className="space-y-1">
              {genres.map((genre) => (
                <Button
                  key={genre.id}
                  variant="ghost"
                  onClick={() => handleCategoryClick(genre.id, genre.name)}
                  className="w-full justify-start h-auto p-3 text-left hover:bg-primary/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <Film className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {genre.name}
                      </p>
                      <p className="text-xs text-secondary">
                        Browse {genre.name.toLowerCase()} movies
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
