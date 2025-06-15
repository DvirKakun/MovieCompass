import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";

interface CategoryFilters {
  minRating: number | null;
  maxRating: number | null;
  minYear: number | null;
  maxYear: number | null;
}

interface CategoryFilterPanelProps {
  showFilters: boolean;
  filters: CategoryFilters;
  onFilterChange: (filters: Partial<CategoryFilters>) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
}

export default function CategoryFilterPanel({
  showFilters,
  filters,
  onFilterChange,
  onResetFilters,
  activeFiltersCount,
}: CategoryFilterPanelProps) {
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Filter Movies
                  </h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onResetFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear all ({activeFiltersCount})
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Rating Filter */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-foreground">
                      Rating Range
                    </Label>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs text-secondary">
                          <span>Minimum Rating</span>
                          <span>{filters.minRating ?? 0}</span>
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
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-xs text-secondary">
                          <span>Maximum Rating</span>
                          <span>{filters.maxRating ?? 10}</span>
                        </div>
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

                    {/* Rating Range Display */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Selected Range:</span>
                        <span className="font-medium text-foreground">
                          {filters.minRating ?? 0} - {filters.maxRating ?? 10}
                        </span>
                      </div>
                    </div>

                    {/* Active Rating Filter Badge */}
                    {((filters.minRating !== null && filters.minRating !== 0) ||
                      (filters.maxRating !== null &&
                        filters.maxRating !== 10)) && (
                      <Badge variant="outline" className="text-xs">
                        Rating: {filters.minRating ?? 0} -{" "}
                        {filters.maxRating ?? 10}
                      </Badge>
                    )}
                  </div>

                  {/* Year Filter */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-foreground">
                      Release Year Range
                    </Label>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs text-secondary">
                          <span>From Year</span>
                          <span>{filters.minYear ?? 1900}</span>
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
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-xs text-secondary">
                          <span>To Year</span>
                          <span>{filters.maxYear ?? currentYear}</span>
                        </div>
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

                    {/* Year Range Display */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Selected Range:</span>
                        <span className="font-medium text-foreground">
                          {filters.minYear ?? 1900} -{" "}
                          {filters.maxYear ?? currentYear}
                        </span>
                      </div>
                    </div>

                    {/* Active Year Filter Badge */}
                    {((filters.minYear !== null && filters.minYear !== 1900) ||
                      (filters.maxYear !== null &&
                        filters.maxYear !== currentYear)) && (
                      <Badge variant="outline" className="text-xs">
                        Year: {filters.minYear ?? 1900} -{" "}
                        {filters.maxYear ?? currentYear}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Filter Summary */}
                {activeFiltersCount > 0 && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary">
                          Active Filters:
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          {activeFiltersCount} applied
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onResetFilters}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Reset All
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
