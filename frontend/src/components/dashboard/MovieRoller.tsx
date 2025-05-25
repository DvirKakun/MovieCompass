import { useRef } from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useMovies } from "../../contexts/MoviesContext";
import MovieCard from "./MovieCard";
import type { Movie } from "../../types/movies";
import { useFetchOnView } from "../../hooks/useFetchOnView";

interface MovieRollerProps {
  title: string;
  genreId: number | null;
}

export default function MovieRoller({ title, genreId }: MovieRollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    state,
    getMoviesByGenre,
    getPopularMovies,
    fetchGenrePage,
    fetchPopularMovies,
  } = useMovies();

  // Get movies for this genre (or empty array if not loaded yet)
  const movies: Movie[] = genreId
    ? getMoviesByGenre(genreId)
    : getPopularMovies();
  const fetchFn = genreId
    ? () => fetchGenrePage(genreId, 1)
    : fetchPopularMovies;
  const viewRef = useFetchOnView(fetchFn);

  // For now, create placeholder movies if none are loaded
  const displayMovies =
    movies.length > 0
      ? movies
      : Array(10)
          .fill(null)
          .map((_, index) => ({
            id: `placeholder-${genreId}-${index}`,
            title: `Movie ${index + 1}`,
            placeholder: true,
          }));

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -400,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  return (
    <div ref={viewRef} className="relative group">
      {/* Section Title */}
      <div className="container mx-auto px-4 mb-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-background/80 to-transparent 
                   flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300
                   hover:from-background/90 focus:outline-none"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>

        {/* Right Scroll Button */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-background/80 to-transparent 
                   flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300
                   hover:from-background/90 focus:outline-none "
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>

        {/* Movies Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-4 px-4 py-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {displayMovies.map((movie, index) => (
            <div key={movie.id || index} className="flex-none">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>

      {/* Error State (if needed) */}
      {state.moviesError && (
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Failed to load {title.toLowerCase()}</span>
          </div>
        </div>
      )}

      {/* Custom CSS for hiding scrollbar */}
      <style>
        {`
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;     /* Firefox */
          }
              
          .scrollbar-hide::-webkit-scrollbar {
            display: none;             /* Chrome, Safari */
          }
        `}
      </style>
    </div>
  );
}
