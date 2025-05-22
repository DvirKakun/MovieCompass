import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { useMovies } from "../../contexts/MoviesContext";
import MovieCard from "./MovieCard";
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

export default function SearchResults() {
  const [showFilters, setShowFilters] = useState(false);
  const { state, setFilters, resetFilters, getGenreName } = useMovies();

  const {
    searchQuery,
    filteredResults,
    searchLoading,
    searchError,
    filters,
    genres,
  } = state;

  const currentYear = new Date().getFullYear();

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "genre" && value !== null) return true;
    if (key === "minRating" && value !== 0) return true;
    if (key === "maxRating" && value !== 10) return true;
    if (key === "minYear" && value !== 1900) return true;
    if (key === "maxYear" && value !== currentYear) return true;
    return false;
  }).length;

  if (searchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-secondary">Searching movies...</p>
        </div>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-destructive">Search failed</p>
          <p className="text-secondary text-sm">{searchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Search Results for {searchQuery}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-secondary">
                {filteredResults.length} movie
                {filteredResults.length !== 1 ? "s" : ""} found
              </p>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  {activeFiltersCount} filter
                  {activeFiltersCount !== 1 ? "s" : ""} applied
                </Badge>
              )}
            </div>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() =>
              setShowFilters((prevShowFilters) => !prevShowFilters)
            }
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge
                variant="default"
                className="bg-primary text-background text-xs px-2 py-0.5"
              >
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-y border-border bg-card/50"
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
                          filters.genre !== null
                            ? filters.genre.toString()
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
                      {filters.genre && (
                        <Badge variant="outline" className="text-xs">
                          {getGenreName(filters.genre)}
                        </Badge>
                      )}
                    </div>

                    {/* Rating Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-foreground">
                        Rating: {filters.minRating} - {filters.maxRating}
                      </Label>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-secondary">
                            <span>Min: {filters.minRating}</span>
                            <span>Max: {filters.maxRating}</span>
                          </div>
                          <Slider
                            value={[filters.minRating ?? 0]}
                            onValueChange={([value]) =>
                              handleFilterChange({ minRating: value })
                            }
                            max={10}
                            min={0}
                            step={0.5}
                            className="w-full"
                          />
                          <Slider
                            value={[filters.maxRating ?? 0]}
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
                        Release Year: {filters.minYear} - {filters.maxYear}
                      </Label>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-secondary">
                            <span>From: {filters.minYear}</span>
                            <span>To: {filters.maxYear}</span>
                          </div>
                          <Slider
                            value={[filters.minYear ?? 1900]}
                            onValueChange={([value]) =>
                              handleFilterChange({ minYear: value })
                            }
                            max={currentYear}
                            min={1900}
                            step={1}
                            className="w-full"
                          />
                          <Slider
                            value={[filters.maxYear ?? currentYear]}
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
                          {filters.genre && (
                            <Badge
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                              onClick={() =>
                                handleFilterChange({ genre: null })
                              }
                            >
                              {getGenreName(filters.genre)} ×
                            </Badge>
                          )}
                          {(filters.minRating !== 0 ||
                            filters.maxRating !== 10) && (
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
                              Rating: {filters.minRating}-{filters.maxRating} ×
                            </Badge>
                          )}
                          {(filters.minYear !== 1900 ||
                            filters.maxYear !== currentYear) && (
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
                              Year: {filters.minYear}-{filters.maxYear} ×
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

      {/* Search Results Grid */}
      <div className="container mx-auto px-4">
        {filteredResults.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-secondary text-lg font-medium">
                    No movies found
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Try adjusting your search terms or filters
                  </p>
                </div>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="mt-4"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {filteredResults.map((movie, index) => (
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
        )}
      </div>
    </div>
  );
}
