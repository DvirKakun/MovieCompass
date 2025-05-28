import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import type { Movie } from "../types/movies";

// State interface (changes frequently)
interface MovieModalState {
  selectedMovie: Movie | null;
  isOpen: boolean;
}

// Actions interface (stable)
interface MovieModalActions {
  openModal: (movie: Movie) => void;
  closeModal: () => void;
}

// Create separate contexts
const MovieModalStateContext = createContext<MovieModalState | undefined>(
  undefined
);
const MovieModalActionsContext = createContext<MovieModalActions | undefined>(
  undefined
);

export const MovieModalProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Memoize actions to keep them stable
  const actions = useMemo(
    (): MovieModalActions => ({
      openModal: (movie: Movie) => {
        setSelectedMovie(movie);
        setIsOpen(true);
      },
      closeModal: () => {
        setIsOpen(false);
        setTimeout(() => setSelectedMovie(null), 300);
      },
    }),
    []
  ); // Empty deps = stable reference

  // State object (changes when modal opens/closes)
  const state: MovieModalState = {
    selectedMovie,
    isOpen,
  };

  return (
    <MovieModalStateContext.Provider value={state}>
      <MovieModalActionsContext.Provider value={actions}>
        {children}
      </MovieModalActionsContext.Provider>
    </MovieModalStateContext.Provider>
  );
};

// Hook for components that need state (only modal component)
export const useMovieModalState = () => {
  const context = useContext(MovieModalStateContext);
  if (!context) {
    throw new Error(
      "useMovieModalState must be used within MovieModalProvider"
    );
  }
  return context;
};

// Hook for components that only need actions (MovieCards, etc.)
export const useMovieModalActions = () => {
  const context = useContext(MovieModalActionsContext);
  if (!context) {
    throw new Error(
      "useMovieModalActions must be used within MovieModalProvider"
    );
  }
  return context;
};

// Convenience hook that combines both (for backward compatibility)
// WARNING: This will cause rerenders - use the split hooks instead
export const useMovieModal = () => {
  const state = useMovieModalState();
  const actions = useMovieModalActions();

  return {
    ...state,
    ...actions,
  };
};
