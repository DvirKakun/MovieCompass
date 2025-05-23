import { createContext, useContext, useState, type ReactNode } from "react";
import type { Movie } from "../types/movies";

interface MovieModalContextType {
  selectedMovie: Movie | null;
  isOpen: boolean;
  openModal: (movie: Movie) => void;
  closeModal: () => void;
}

const MovieModalContext = createContext<MovieModalContextType | undefined>(
  undefined
);

export const MovieModalProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedMovie(null), 300);
  };

  return (
    <MovieModalContext.Provider
      value={{ selectedMovie, isOpen, openModal, closeModal }}
    >
      {children}
    </MovieModalContext.Provider>
  );
};

export const useMovieModal = () => {
  const context = useContext(MovieModalContext);
  if (!context)
    throw new Error("useMovieModal must be used within MovieModalProvider");
  return context;
};
