import { createContext, useContext, useReducer, type ReactNode } from "react";
import type {
  GenreResponse,
  Movie,
  MovieFilters,
  MoviesAction,
  MoviesResponse,
  MoviesState,
} from "../types/movies";
import { BACKEND_URL } from "../data/constants";

const initialState: MoviesState = {
  genres: [],
  genreMap: new Map(),
  genresLoading: false,
  genresError: null,

  popularMovies: [],
  popularLoading: false,
  popularError: null,

  moviesByGenre: new Map(),
  rollersLoading: false,
  rollersError: null,

  searchQuery: "",
  searchResults: [],
  searchLoading: false,
  searchError: null,

  filters: {
    genre: null,
    minRating: 0,
    maxRating: 10,
    minYear: 1900,
    maxYear: new Date().getFullYear(),
  },
  filteredResults: [],
};

function moviesReducer(state: MoviesState, action: MoviesAction): MoviesState {
  switch (action.type) {
    // Genres
    case "FETCH_GENRES_START":
      return {
        ...state,
        genresLoading: true,
        genresError: null,
      };

    case "FETCH_GENRES_SUCCESS":
      const genreMap = new Map<number, string>();

      action.payload.forEach((genre) => {
        genreMap.set(genre.id, genre.name);
      });

      return {
        ...state,
        genres: action.payload,
        genreMap,
        genresLoading: false,
        genresError: null,
      };

    case "FETCH_GENRES_ERROR":
      return {
        ...state,
        genresLoading: false,
        genresError: action.payload,
      };

    //Popular

    case "FETCH_POPULAR_START":
      return {
        ...state,
        popularLoading: true,
        popularError: null,
      };

    case "FETCH_POPULAR_SUCCESS":
      return {
        ...state,
        popularMovies: action.payload,
        popularLoading: false,
        popularError: null,
      };

    case "FETCH_POPULAR_ERROR":
      return {
        ...state,
        popularLoading: false,
        popularError: action.payload,
      };

    // Movie rollers
    case "FETCH_ROLLERS_START":
      return {
        ...state,
        rollersLoading: true,
        rollersError: null,
      };

    case "FETCH_ROLLERS_SUCCESS":
      const newMoviesByGenre = new Map(state.moviesByGenre);

      newMoviesByGenre.set(action.payload.genreId, action.payload.movies);

      return {
        ...state,
        moviesByGenre: newMoviesByGenre,
        rollersLoading: false,
        rollersError: null,
      };

    case "FETCH_ROLLERS_ERROR":
      return {
        ...state,
        rollersLoading: false,
        rollersError: action.payload,
      };

    // Search
    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
      };

    case "FETCH_SEARCH_START":
      return {
        ...state,
        searchLoading: true,
        searchError: null,
      };

    case "FETCH_SEARCH_SUCCESS":
      return {
        ...state,
        searchResults: action.payload,
        searchLoading: false,
        searchError: null,
        filteredResults: applyFilters(action.payload, state.filters),
      };

    case "FETCH_SEARCH_ERROR":
      return {
        ...state,
        searchLoading: false,
        searchError: action.payload,
      };

    case "CLEAR_SEARCH":
      return {
        ...state,
        searchQuery: "",
        searchResults: [],
        filteredResults: [],
        searchError: null,
      };

    // Filters
    case "SET_FILTERS":
      const newFilters = { ...state.filters, ...action.payload };

      return {
        ...state,
        filters: newFilters,
        filteredResults: applyFilters(state.searchResults, newFilters),
      };

    case "RESET_FILTERS":
      return {
        ...state,
        filters: initialState.filters,
        filteredResults: state.searchResults,
      };

    case "APPLY_FILTERS":
      return {
        ...state,
        filteredResults: applyFilters(state.searchResults, state.filters),
      };

    default:
      return state;
  }
}

function applyFilters(movies: Movie[], filters: MovieFilters): Movie[] {
  return movies.filter((movie) => {
    // Genre filter
    if (filters.genre !== null) {
      const genreIds =
        movie.genre_ids ?? movie.genres?.map((genre) => genre.id) ?? [];

      if (!genreIds.includes(filters.genre)) {
        return false;
      }
    }

    // Rating filter
    if (filters.minRating !== null && movie.vote_average < filters.minRating) {
      return false;
    }

    if (filters.maxRating !== null && movie.vote_average > filters.maxRating) {
      return false;
    }

    // Year filter
    const movieYear = new Date(movie.release_date).getFullYear();

    if (filters.minYear !== null && movieYear < filters.minYear) {
      return false;
    }

    if (filters.maxYear !== null && movieYear > filters.maxYear) {
      return false;
    }

    return true;
  });
}

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

interface MoviesContextType {
  state: MoviesState;

  // Genre actions
  fetchGenres: () => Promise<void>;

  // Movie roller actions
  fetchMoviesByGenre: (genreId: number) => Promise<void>;

  // Popluar movies action
  fetchPopularMovies: () => Promise<void>;

  // Search actions
  setSearchQuery: (query: string) => void;
  searchMovies: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Filter actions
  setFilters: (filters: Partial<MovieFilters>) => void;
  resetFilters: () => void;

  // Helper functions
  getGenreName: (genreId: number) => string;
  getMoviesByGenre: (genreId: number) => Movie[];
  getPopularMovies: () => Movie[];
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

// Provider component
interface MoviesProviderProps {
  children: ReactNode;
}

export function MoviesProvider({ children }: MoviesProviderProps) {
  const [state, dispatch] = useReducer(moviesReducer, initialState);

  // Genre actions
  const fetchGenres = async () => {
    dispatch({ type: "FETCH_GENRES_START" });
    try {
      const response = await fetch(`${BACKEND_URL}/movies/genres`);

      if (!response.ok) {
        throw new Error("Failed to fetch genres");
      }

      const genres_data: GenreResponse = await response.json();

      dispatch({ type: "FETCH_GENRES_SUCCESS", payload: genres_data.genres });
    } catch (error) {
      let message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_GENRES_ERROR",
        payload: message,
      });
    }
  };

  // Movie roller actions
  const fetchMoviesByGenre = async (genreId: number) => {
    dispatch({ type: "FETCH_ROLLERS_START" });

    try {
      const response = await fetch(`${BACKEND_URL}/movies/genre/${genreId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch movies for genre ${genreId}`);
      }

      const movies_data: MoviesResponse = await response.json();
      const movies = movies_data.movies;

      dispatch({
        type: "FETCH_ROLLERS_SUCCESS",
        payload: { genreId, movies },
      });
    } catch (error) {
      let message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_ROLLERS_ERROR",
        payload: message,
      });
    }
  };

  // Fetch popular movies
  const fetchPopularMovies = async () => {
    dispatch({ type: "FETCH_POPULAR_START" });

    try {
      const response = await fetch(`${BACKEND_URL}/movies/popular`);

      if (!response.ok) {
        throw new Error("Failed to fetch popular movies");
      }

      const movies_data: MoviesResponse = await response.json();
      const movies = movies_data.movies;

      dispatch({
        type: "FETCH_POPULAR_SUCCESS",
        payload: movies,
      });
    } catch (error) {
      let message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_POPULAR_ERROR",
        payload: message,
      });
    }
  };

  // Search actions
  const setSearchQuery = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };

  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      dispatch({ type: "CLEAR_SEARCH" });

      return;
    }

    dispatch({ type: "FETCH_SEARCH_START" });
    try {
      const response = await fetch(
        `${BACKEND_URL}/movies/search?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Failed to search movies");
      }
      const movies_data: MoviesResponse = await response.json();
      const movies = movies_data.movies;

      dispatch({ type: "FETCH_SEARCH_SUCCESS", payload: movies });
    } catch (error) {
      let message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_SEARCH_ERROR",
        payload: message,
      });
    }
  };

  const clearSearch = () => {
    dispatch({ type: "CLEAR_SEARCH" });
  };

  // Filter actions
  const setFilters = (filters: Partial<MovieFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  };

  const resetFilters = () => {
    dispatch({ type: "RESET_FILTERS" });
  };

  // Helper functions
  const getGenreName = (genreId: number): string => {
    return state.genreMap.get(genreId) || "Unknown Genre";
  };

  const getMoviesByGenre = (genreId: number): Movie[] => {
    return state.moviesByGenre.get(genreId) || [];
  };

  const getPopularMovies = (): Movie[] => {
    return state.popularMovies;
  };

  const contextValue: MoviesContextType = {
    state,
    fetchGenres,
    fetchMoviesByGenre,
    fetchPopularMovies,
    setSearchQuery,
    searchMovies,
    clearSearch,
    setFilters,
    resetFilters,
    getGenreName,
    getMoviesByGenre,
    getPopularMovies,
  };

  return (
    <MoviesContext.Provider value={contextValue}>
      {children}
    </MoviesContext.Provider>
  );
}

// Custom hook
export function useMovies() {
  const context = useContext(MoviesContext);

  if (context === undefined) {
    throw new Error("useMovies must be used within a MoviesProvider");
  }
  return context;
}
