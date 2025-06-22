// src/pages/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import SearchNavbar from "../../components/search/SearchNavbar";
import MovieDetailModal from "../common/movie_modal/MovieDetailModal";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SearchNavbar />
      {/* Nested pages render right here */}
      <Outlet />

      {/* Global modal lives outside the pages, inside MovieModalProvider */}
      <MovieDetailModal />
    </div>
  );
}
