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

// Define the filter interface
export interface MovieFilters {
  genre: number | null;
  minRating: number | null;
  maxRating: number | null;
  minYear: number | null;
  maxYear: number | null;
}

// Genre interface
export interface Genre {
  id: number;
  name: string;
}

interface FilterPanelProps {
  showFilters: boolean;
  filters: MovieFilters;
  onFilterChange: (filters: Partial<MovieFilters>) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;

  // Required props for genre functionality
  genres: Genre[];
  getGenreName: (genreId: number) => string;
}

export default function FilterPanel({
  showFilters,
  filters,
  onFilterChange,
  onResetFilters,
  activeFiltersCount,
  genres,
  getGenreName,
}: FilterPanelProps) {
  const currentYear = new Date().getFullYear();

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
                        filters.genre !== null
                          ? filters.genre.toString()
                          : "all"
                      }
                      onValueChange={(value) =>
                        onFilterChange({
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
                      Rating: {filters.minRating ?? 0} -{" "}
                      {filters.maxRating ?? 10}
                    </Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-secondary">
                          <span>Min: {filters.minRating ?? 0}</span>
                          <span>Max: {filters.maxRating ?? 10}</span>
                        </div>
                        <Slider
                          value={[filters.minRating ?? 0]}
                          onValueChange={([value]) =>
                            onFilterChange({ minRating: value })
                          }
                          max={10}
                          min={0}
                          step={0.5}
                          className="w-full"
                        />
                        <Slider
                          value={[filters.maxRating ?? 10]}
                          onValueChange={([value]) =>
                            onFilterChange({ maxRating: value })
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
                      Release Year: {filters.minYear ?? 1900} -{" "}
                      {filters.maxYear ?? currentYear}
                    </Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-secondary">
                          <span>From: {filters.minYear ?? 1900}</span>
                          <span>To: {filters.maxYear ?? currentYear}</span>
                        </div>
                        <Slider
                          value={[filters.minYear ?? 1900]}
                          onValueChange={([value]) =>
                            onFilterChange({ minYear: value })
                          }
                          max={currentYear}
                          min={1900}
                          step={1}
                          className="w-full"
                        />
                        <Slider
                          value={[filters.maxYear ?? currentYear]}
                          onValueChange={([value]) =>
                            onFilterChange({ maxYear: value })
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
                      onClick={onResetFilters}
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
                            onClick={() => onFilterChange({ genre: null })}
                          >
                            {getGenreName(filters.genre)} ×
                          </Badge>
                        )}
                        {((filters.minRating ?? 0) !== 0 ||
                          (filters.maxRating ?? 10) !== 10) && (
                          <Badge
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              onFilterChange({
                                minRating: 0,
                                maxRating: 10,
                              })
                            }
                          >
                            Rating: {filters.minRating ?? 0}-
                            {filters.maxRating ?? 10} ×
                          </Badge>
                        )}
                        {((filters.minYear ?? 1900) !== 1900 ||
                          (filters.maxYear ?? currentYear) !== currentYear) && (
                          <Badge
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              onFilterChange({
                                minYear: 1900,
                                maxYear: currentYear,
                              })
                            }
                          >
                            Year: {filters.minYear ?? 1900}-
                            {filters.maxYear ?? currentYear} ×
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
