import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import SearchResults from "../components/search/SearchResults";
import { useMovies } from "../contexts/MoviesContext";
import { useMovieModal } from "../contexts/MovieModalContext";
import MovieDetailModal from "../components/dashboard/movie_modal/MovieDetailModal";

export default function SearchPage() {
  const navigate = useNavigate();
  const { clearSearch } = useMovies();
  const { isOpen, selectedMovie, closeModal } = useMovieModal();

  const handleBackToDashboard = () => {
    clearSearch();
    navigate("/dashboard");
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-8">
          <div className="container mx-auto px-4 mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="p-0 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to browse
            </Button>
          </div>
          <SearchResults />
        </main>
      </div>
      {selectedMovie && (
        <MovieDetailModal
          isOpen={isOpen}
          onClose={closeModal}
          movie={selectedMovie}
        />
      )}
    </>
  );
}
