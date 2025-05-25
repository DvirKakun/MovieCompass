import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import SearchResults from "../components/search/SearchResults";
import { useMovies } from "../contexts/MoviesContext";

export default function SearchPage() {
  const navigate = useNavigate();
  const { clearSearch } = useMovies();

  const handleBackToDashboard = () => {
    clearSearch();
    navigate("/dashboard");
  };

  return (
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
  );
}
