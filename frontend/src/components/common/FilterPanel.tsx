import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { useMovies } from "../../contexts/MoviesContext";
import type { MovieFilters } from "../../types/movies";

interface FilterPanelProps {
  showFilters: boolean;
  filters: MovieFilters;
  onFilterChange: (filters: Partial<MovieFilters>) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
  useContextFilters?: boolean;
}

export default function FilterPanel({
  showFilters,
  filters,
  onFilterChange,
  onResetFilters,
  activeFiltersCount,
  useContextFilters = false,
}: FilterPanelProps) {
  const moviesContext = useMovies();

  // Use context filters for SearchResults, or local filters for FavoritesPage
  const {
    state: { genres },
    setFilters: setContextFilters,
    resetFilters: resetContextFilters,
    getGenreName,
  } = moviesContext;

  const currentYear = new Date().getFullYear();

  // Handle filter changes - either local or context-based
  const handleFilterChange = (newFilters: Partial<MovieFilters>) => {
    if (useContextFilters) {
      setContextFilters(newFilters);
    } else {
      onFilterChange(newFilters);
    }
  };

  const handleResetFilters = () => {
    if (useContextFilters) {
      resetContextFilters();
    } else {
      onResetFilters();
    }
  };

  // Use context filters for SearchResults, local filters for others
  const currentFilters = useContextFilters
    ? moviesContext.state.filters
    : filters;

  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-y border-border bg-card/50 mb-8"
        >
          <div className="container mx-auto px-4 py-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Genre Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">
                      Genre
                    </Label>
                    <Select
                      value={
                        currentFilters.genre !== null
                          ? currentFilters.genre.toString()
                          : "all"
                      }
                      onValueChange={(value) =>
                        handleFilterChange({
                          genre: value === "all" ? null : parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Genres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genres</SelectItem>
                        {genres.map((genre) => (
                          <SelectItem
                            key={genre.id}
                            value={genre.id.toString()}
                          >
                            {genre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentFilters.genre && (
                      <Badge variant="outline" className="text-xs">
                        {getGenreName(currentFilters.genre)}
                      </Badge>
                    )}
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">
                      Rating: {currentFilters.minRating ?? 0} -{" "}
                      {currentFilters.maxRating ?? 10}
                    </Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-secondary">
                          <span>Min: {currentFilters.minRating ?? 0}</span>
                          <span>Max: {currentFilters.maxRating ?? 10}</span>
                        </div>
                        <Slider
                          value={[currentFilters.minRating ?? 0]}
                          onValueChange={([value]) =>
                            handleFilterChange({ minRating: value })
                          }
                          max={10}
                          min={0}
                          step={0.5}
                          className="w-full"
                        />
                        <Slider
                          value={[currentFilters.maxRating ?? 10]}
                          onValueChange={([value]) =>
                            handleFilterChange({ maxRating: value })
                          }
                          max={10}
                          min={0}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Year Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">
                      Release Year: {currentFilters.minYear ?? 1900} -{" "}
                      {currentFilters.maxYear ?? currentYear}
                    </Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-secondary">
                          <span>From: {currentFilters.minYear ?? 1900}</span>
                          <span>
                            To: {currentFilters.maxYear ?? currentYear}
                          </span>
                        </div>
                        <Slider
                          value={[currentFilters.minYear ?? 1900]}
                          onValueChange={([value]) =>
                            handleFilterChange({ minYear: value })
                          }
                          max={currentYear}
                          min={1900}
                          step={1}
                          className="w-full"
                        />
                        <Slider
                          value={[currentFilters.maxYear ?? currentYear]}
                          onValueChange={([value]) =>
                            handleFilterChange({ maxYear: value })
                          }
                          max={currentYear}
                          min={1900}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reset Filters */}
                  <div className="flex flex-col justify-end space-y-3">
                    <Label className="text-sm font-medium text-foreground">
                      Actions
                    </Label>
                    <Button
                      variant="outline"
                      onClick={handleResetFilters}
                      className="w-full"
                      disabled={activeFiltersCount === 0}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reset Filters
                    </Button>
                    {activeFiltersCount > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {currentFilters.genre && (
                          <Badge
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleFilterChange({ genre: null })}
                          >
                            {getGenreName(currentFilters.genre)} ×
                          </Badge>
                        )}
                        {((currentFilters.minRating ?? 0) !== 0 ||
                          (currentFilters.maxRating ?? 10) !== 10) && (
                          <Badge
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              handleFilterChange({
                                minRating: 0,
                                maxRating: 10,
                              })
                            }
                          >
                            Rating: {currentFilters.minRating ?? 0}-
                            {currentFilters.maxRating ?? 10} ×
                          </Badge>
                        )}
                        {((currentFilters.minYear ?? 1900) !== 1900 ||
                          (currentFilters.maxYear ?? currentYear) !==
                            currentYear) && (
                          <Badge
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              handleFilterChange({
                                minYear: 1900,
                                maxYear: currentYear,
                              })
                            }
                          >
                            Year: {currentFilters.minYear ?? 1900}-
                            {currentFilters.maxYear ?? currentYear} ×
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
