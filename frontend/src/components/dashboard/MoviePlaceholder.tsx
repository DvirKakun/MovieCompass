import { Clock } from "lucide-react";

export default function MoviePlaceholder() {
  return (
    <div className="w-48 flex-none">
      {/* Placeholder Poster */}
      <div className="relative group cursor-pointer">
        <div className="w-48 h-72 bg-muted rounded-lg border border-border flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-border rounded-full mx-auto flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                        transition-opacity duration-300 rounded-lg flex items-center justify-center"
        >
          <div className="text-center">
            <p className="text-white text-sm">Movie Poster</p>
          </div>
        </div>
      </div>

      {/* Placeholder Movie Info */}
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse"></div>
        <div className="flex items-center space-x-2">
          <div className="h-3 bg-muted rounded w-12 animate-pulse"></div>
          <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
