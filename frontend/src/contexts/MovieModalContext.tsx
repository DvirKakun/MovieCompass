// import {
//   createContext,
//   useContext,
//   useState,
//   useMemo,
//   type ReactNode,
// } from "react";
// import type { Movie, MovieTrailer } from "../types/movies";

// // State interface (changes frequently)
// interface MovieModalState {
//   selectedMovie: Movie | null;
//   isOpen: boolean;
// }

// // Actions interface (stable)
// interface MovieModalActions {
//   openModal: (movie: Movie) => void;
//   closeModal: () => void;
// }

// // Create separate contexts
// const MovieModalStateContext = createContext<MovieModalState | undefined>(
//   undefined
// );
// const MovieModalActionsContext = createContext<MovieModalActions | undefined>(
//   undefined
// );

// export const MovieModalProvider = ({ children }: { children: ReactNode }) => {
//   const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
//   const [isOpen, setIsOpen] = useState(false);

//   // Memoize actions to keep them stable
//   const actions = useMemo(
//     (): MovieModalActions => ({
//       openModal: (movie: Movie) => {
//         setSelectedMovie(movie);
//         setIsOpen(true);
//       },
//       closeModal: () => {
//         setIsOpen(false);
//         setTimeout(() => setSelectedMovie(null), 300);
//       },
//     }),
//     []
//   ); // Empty deps = stable reference

//   // State object (changes when modal opens/closes)
//   const state: MovieModalState = {
//     selectedMovie,
//     isOpen,
//   };

//   return (
//     <MovieModalStateContext.Provider value={state}>
//       <MovieModalActionsContext.Provider value={actions}>
//         {children}
//       </MovieModalActionsContext.Provider>
//     </MovieModalStateContext.Provider>
//   );
// };

// // Hook for components that need state (only modal component)
// export const useMovieModalState = () => {
//   const context = useContext(MovieModalStateContext);
//   if (!context) {
//     throw new Error(
//       "useMovieModalState must be used within MovieModalProvider"
//     );
//   }
//   return context;
// };

// // Hook for components that only need actions (MovieCards, etc.)
// export const useMovieModalActions = () => {
//   const context = useContext(MovieModalActionsContext);
//   if (!context) {
//     throw new Error(
//       "useMovieModalActions must be used within MovieModalProvider"
//     );
//   }
//   return context;
// };

// // Convenience hook that combines both (for backward compatibility)
// // WARNING: This will cause rerenders - use the split hooks instead
// export const useMovieModal = () => {
//   const state = useMovieModalState();
//   const actions = useMovieModalActions();

//   return {
//     ...state,
//     ...actions,
//   };
// };

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
} from "react";
import type { Movie, MovieTrailer } from "../types/movies";
import { BACKEND_URL } from "../data/constants";
import type { MovieModalAction, MovieModalState } from "../types/movie_modal";

// Initial state
const initialState: MovieModalState = {
  selectedMovie: null,
  isOpen: false,
  trailers: new Map(),
  trailersLoading: new Map(),
  trailersError: new Map(),
};

// Reducer
function movieModalReducer(
  state: MovieModalState,
  action: MovieModalAction
): MovieModalState {
  switch (action.type) {
    case "OPEN_MODAL":
      return {
        ...state,
        selectedMovie: action.payload,
        isOpen: true,
      };

    case "CLOSE_MODAL":
      return {
        ...state,
        isOpen: false,
      };

    case "CLEAR_SELECTED_MOVIE":
      return {
        ...state,
        selectedMovie: null,
      };

    case "FETCH_TRAILER_START": {
      const { movieId } = action.payload;
      const newTrailersLoading = new Map(state.trailersLoading);
      const newTrailersError = new Map(state.trailersError);

      newTrailersLoading.set(movieId, true);
      newTrailersError.delete(movieId);

      return {
        ...state,
        trailersLoading: newTrailersLoading,
        trailersError: newTrailersError,
      };
    }

    case "FETCH_TRAILER_SUCCESS": {
      const { movieId, trailer } = action.payload;
      const newTrailers = new Map(state.trailers);
      const newTrailersLoading = new Map(state.trailersLoading);

      newTrailers.set(movieId, trailer);
      newTrailersLoading.set(movieId, false);

      return {
        ...state,
        trailers: newTrailers,
        trailersLoading: newTrailersLoading,
      };
    }

    case "FETCH_TRAILER_ERROR": {
      const { movieId, error } = action.payload;
      const newTrailersLoading = new Map(state.trailersLoading);
      const newTrailersError = new Map(state.trailersError);

      newTrailersLoading.set(movieId, false);
      newTrailersError.set(movieId, error);

      return {
        ...state,
        trailersLoading: newTrailersLoading,
        trailersError: newTrailersError,
      };
    }

    default:
      return state;
  }
}

// Actions interface for context
interface MovieModalActions {
  openModal: (movie: Movie) => void;
  closeModal: () => void;
  // Trailer actions
  fetchMovieTrailer: (movieId: number) => Promise<void>;
  // Getters
  getTrailer: (movieId: number) => MovieTrailer | undefined;
  isTrailerLoading: (movieId: number) => boolean;
  getTrailerError: (movieId: number) => string | undefined;
}

// Create separate contexts
const MovieModalStateContext = createContext<MovieModalState | undefined>(
  undefined
);
const MovieModalActionsContext = createContext<MovieModalActions | undefined>(
  undefined
);

async function getErrorMessage(error: any) {
  let message = "Unknown error";

  if (error instanceof Response) {
    try {
      const errData = await error.json();

      message = errData.errors?.[0]?.message || message;
    } catch {
      message = "Failed to parse error response";
    } finally {
      return message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return message;
}

export const MovieModalProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(movieModalReducer, initialState);

  // Stable actions that don't depend on state (memoized with empty deps)
  const stableActions = useMemo(
    () => ({
      openModal: (movie: Movie) => {
        dispatch({ type: "OPEN_MODAL", payload: movie });
      },
      closeModal: () => {
        dispatch({ type: "CLOSE_MODAL" });
        setTimeout(() => {
          dispatch({ type: "CLEAR_SELECTED_MOVIE" });
        }, 300);
      },
    }),
    []
  );

  // Fetch function that needs current state for the check
  const fetchMovieTrailer = async (movieId: number) => {
    // if we already have it, do nothing
    if (state.trailers.has(movieId) || state.trailersLoading.get(movieId))
      return;

    dispatch({ type: "FETCH_TRAILER_START", payload: { movieId } });

    try {
      const res = await fetch(`${BACKEND_URL}/movies/${movieId}/trailer`);

      if (!res.ok) throw new Error("Failed to fetch trailer");

      const trailer = await res.json();

      dispatch({
        type: "FETCH_TRAILER_SUCCESS",
        payload: { movieId, trailer },
      });
    } catch (error) {
      const message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_TRAILER_ERROR",
        payload: { movieId, error: message },
      });
    }
  };

  // Actions that include both stable and state-dependent functions
  const actions: MovieModalActions = {
    ...stableActions,
    fetchMovieTrailer,
    // Getters that need current state
    getTrailer: (movieId: number) => state.trailers.get(movieId),
    isTrailerLoading: (movieId: number) =>
      state.trailersLoading.get(movieId) ?? false,
    getTrailerError: (movieId: number) => state.trailersError.get(movieId),
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
