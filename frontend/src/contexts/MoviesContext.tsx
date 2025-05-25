import { createContext, useContext, useReducer, type ReactNode } from "react";
import type {
  CastMember,
  GenreResponse,
  Movie,
  MovieFilters,
  MoviesAction,
  MoviesResponse,
  MoviesState,
  MovieTrailer,
  Review,
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
  popularCurrentPage: 0,
  popularHasMore: true,

  moviesByGenre: new Map(),
  pagesByGenre: new Map(),
  hasMoreByGenre: new Map(),
  moviesLoading: false,
  moviesError: null,

  searchQuery: "",
  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchCurrentPage: 1,
  searchHasMore: true,

  filters: {
    genre: null,
    minRating: 0,
    maxRating: 10,
    minYear: 1900,
    maxYear: new Date().getFullYear(),
  },
  filteredResults: [],

  trailers: new Map(),
  trailersLoading: new Map(),
  trailersError: new Map(),

  casts: new Map(),
  castsLoading: new Map(),
  castsError: new Map(),

  reviews: new Map(),
  reviewsLoading: new Map(),
  reviewsError: new Map(),
  reviewPages: new Map(),
  reviewHasMore: new Map(),
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

    case "FETCH_POPULAR_PAGE_START":
      return { ...state, popularLoading: true, popularError: null };

    case "FETCH_POPULAR_PAGE_SUCCESS": {
      const { movies, page, hasMore } = action.payload;

      // dedupe
      const ids = new Set(state.popularMovies.map((m) => m.id));
      const merged = [
        ...state.popularMovies,
        ...movies.filter((m) => !ids.has(m.id)),
      ];

      return {
        ...state,
        popularMovies: merged,
        popularCurrentPage: page,
        popularHasMore: hasMore,
        popularLoading: false,
      };
    }

    case "FETCH_POPULAR_PAGE_ERROR":
      return { ...state, popularLoading: false, popularError: action.payload };

    // Movie actions
    case "FETCH_GENRE_PAGE_START":
      return {
        ...state,
        moviesLoading: true,
        moviesError: null,
      };

    case "FETCH_GENRE_PAGE_SUCCESS": {
      const { genreId, page, movies, hasMore } = action.payload;

      const prevMovies = state.moviesByGenre.get(genreId) ?? [];
      const seenIds = new Set(prevMovies.map((m) => m.id));
      const merged = [
        ...prevMovies,
        ...movies.filter((m) => !seenIds.has(m.id)),
      ];

      return {
        ...state,
        moviesByGenre: new Map(state.moviesByGenre).set(genreId, merged),
        pagesByGenre: new Map(state.pagesByGenre).set(genreId, page),
        hasMoreByGenre: new Map(state.hasMoreByGenre).set(genreId, hasMore),
        moviesLoading: false,
      };
    }

    case "FETCH_GENRE_PAGE_ERROR":
      return {
        ...state,
        moviesLoading: false,
        moviesError: action.payload,
      };

    // Search
    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
        searchResults: [],
        searchCurrentPage: 0,
        searchHasMore: true,
      };

    case "FETCH_SEARCH_PAGE_START":
      return { ...state, searchLoading: true, searchError: null };

    case "FETCH_SEARCH_PAGE_SUCCESS": {
      const { movies, page, hasMore } = action.payload;

      const ids = new Set(state.searchResults.map((m) => m.id));
      const merged = [
        ...state.searchResults,
        ...movies.filter((m) => !ids.has(m.id)),
      ];

      return {
        ...state,
        searchResults: merged,
        filteredResults: applyFilters(merged, state.filters),
        searchCurrentPage: page,
        searchHasMore: hasMore,
        searchLoading: false,
      };
    }

    case "FETCH_SEARCH_PAGE_ERROR":
      return { ...state, searchLoading: false, searchError: action.payload };

    case "CLEAR_SEARCH":
      return {
        ...state,
        searchQuery: "",
        searchResults: [],
        searchCurrentPage: 0,
        searchHasMore: true,
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

    // Trailers
    case "FETCH_TRAILER_START": {
      const { movieId } = action.payload;
      const trailers_loading_map = new Map(state.trailersLoading).set(
        movieId,
        true
      );
      const trailers_errors_map = new Map(state.trailersError);

      trailers_loading_map.delete(movieId);

      return {
        ...state,
        trailersLoading: trailers_loading_map,
        trailersError: trailers_errors_map,
      };
    }

    case "FETCH_TRAILER_SUCCESS": {
      const { movieId, trailer } = action.payload;
      const trailers_map = new Map(state.trailers).set(movieId, trailer);
      const trailers_loading_map = new Map(state.trailersLoading).set(
        movieId,
        false
      );

      return {
        ...state,
        trailers: trailers_map,
        trailersLoading: trailers_loading_map,
      };
    }

    case "FETCH_TRAILER_ERROR": {
      const { movieId, error } = action.payload;

      const trailers_loading_map = new Map(state.trailersLoading).set(
        movieId,
        false
      );
      const trailers_error_map = new Map(state.trailersError).set(
        movieId,
        error
      );

      return {
        ...state,
        trailersLoading: trailers_loading_map,
        trailersError: trailers_error_map,
      };
    }

    //Cast
    case "FETCH_CAST_START": {
      const { movieId } = action.payload;
      const cast_loading_map = new Map(state.castsLoading).set(movieId, true);
      const cast_error_map = new Map(state.castsError);

      cast_error_map.delete(movieId);

      return {
        ...state,
        castsLoading: cast_loading_map,
        castsError: cast_error_map,
      };
    }

    case "FETCH_CAST_SUCCESS": {
      const { movieId, cast } = action.payload;
      const cast_map = new Map(state.casts).set(movieId, cast);
      const cast_loading_map = new Map(state.castsLoading).set(movieId, false);

      return {
        ...state,
        casts: cast_map,
        castsLoading: cast_loading_map,
      };
    }

    case "FETCH_CAST_ERROR": {
      const { movieId, error } = action.payload;
      const cast_loading_map = new Map(state.castsLoading).set(movieId, false);
      const cast_error_map = new Map(state.castsError).set(movieId, error);

      return {
        ...state,
        castsLoading: cast_loading_map,
        castsError: cast_error_map,
      };
    }

    // Reviews
    case "FETCH_REVIEWS_PAGE_START": {
      const { movieId } = action.payload;
      const loading = new Map(state.reviewsLoading).set(movieId, true);
      const error = new Map(state.reviewsError);

      error.delete(movieId);

      return { ...state, reviewsLoading: loading, reviewsError: error };
    }

    case "FETCH_REVIEWS_PAGE_SUCCESS": {
      const { movieId, reviews, page, hasMore } = action.payload;
      const prevReviews = state.reviews.get(movieId) ?? [];
      const mergedReviews = [
        ...prevReviews,
        ...reviews.filter(
          (review) =>
            !prevReviews.some((prevReview) => prevReview.id === review.id)
        ),
      ];

      return {
        ...state,
        reviews: new Map(state.reviews).set(movieId, mergedReviews),
        reviewPages: new Map(state.reviewPages).set(movieId, page),
        reviewHasMore: new Map(state.reviewHasMore).set(movieId, hasMore),
        reviewsLoading: new Map(state.reviewsLoading).set(movieId, false),
      };
    }

    case "FETCH_REVIEWS_PAGE_ERROR": {
      const { movieId, error } = action.payload;

      return {
        ...state,
        reviewsLoading: new Map(state.reviewsLoading).set(movieId, false),
        reviewsError: new Map(state.reviewsError).set(movieId, error),
      };
    }

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
  fetchGenrePage: (genreId: number, explicitPage?: number) => Promise<void>;

  // Popluar movies action
  fetchPopularPage: (explicitPage?: number) => Promise<void>;

  // Trailers action
  fetchMovieTrailer: (movieId: number) => Promise<void>;

  // Cast action
  fetchMovieCast: (id: number) => Promise<void>;

  // Reviews action
  fetchReviewPage: (movieId: number, explicitPage?: number) => Promise<void>;

  // Search actions
  setSearchQuery: (query: string) => void;
  fetchSearchPage: (query: string, explicitPage?: number) => Promise<void>;
  clearSearch: () => void;

  // Filter actions
  setFilters: (filters: Partial<MovieFilters>) => void;
  resetFilters: () => void;

  // Helper functions
  getGenreName: (genreId: number) => string;
  getMoviesByGenre: (genreId: number) => Movie[];
  getPopularMovies: () => Movie[];
  getTrailer: (movieId: number) => MovieTrailer | undefined;
  isTrailerLoading: (movieId: number) => boolean;
  trailerError: (movieId: number) => string | null;
  getCast: (id: number) => CastMember[];
  isCastLoading: (id: number) => boolean;
  castError: (id: number) => string | null;
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

  // Movies actions
  const fetchGenrePage = async (genreId: number, explicitPage?: number) => {
    dispatch({ type: "FETCH_GENRE_PAGE_START" });

    const nextPage = explicitPage ?? (state.pagesByGenre.get(genreId) ?? 0) + 1;

    try {
      const res = await fetch(
        `${BACKEND_URL}/movies/genre/${genreId}?page=${nextPage}`
      );

      if (!res.ok) throw new Error("Failed to fetch genre movies");

      const data: MoviesResponse = await res.json();
      const movies = data.movies;
      const hasMore = movies.length > 0;

      dispatch({
        type: "FETCH_GENRE_PAGE_SUCCESS",
        payload: { genreId, page: nextPage, movies, hasMore },
      });
    } catch (error) {
      let message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_GENRE_PAGE_ERROR",
        payload: message,
      });
    }
  };

  // Fetch popular movies
  const fetchPopularPage = async (explicitPage?: number) => {
    dispatch({ type: "FETCH_POPULAR_PAGE_START" });

    const page = explicitPage ?? state.popularCurrentPage + 1;

    try {
      const res = await fetch(`${BACKEND_URL}/movies/popular?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch popular movies");

      const data: MoviesResponse = await res.json();
      const movies = data.movies;
      const hasMore = movies.length > 0;

      dispatch({
        type: "FETCH_POPULAR_PAGE_SUCCESS",
        payload: { movies, page, hasMore },
      });
    } catch (error) {
      let message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_POPULAR_PAGE_ERROR",
        payload: message,
      });
    }
  };
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
      let message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_TRAILER_ERROR",
        payload: { movieId, error: message },
      });
    }
  };

  const fetchMovieCast = async (movieId: number) => {
    if (state.casts.has(movieId) || state.castsLoading.get(movieId)) return;

    dispatch({ type: "FETCH_CAST_START", payload: { movieId } });

    try {
      const res = await fetch(`${BACKEND_URL}/movies/${movieId}/cast`);

      if (!res.ok) throw new Error("Failed to fetch cast");

      const data = await res.json();
      dispatch({
        type: "FETCH_CAST_SUCCESS",
        payload: { movieId, cast: data.cast.slice(0, 10) },
      });
    } catch (error) {
      let message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_CAST_ERROR",
        payload: { movieId, error: message },
      });
    }
  };

  // Search actions
  const setSearchQuery = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };

  const fetchSearchPage = async (query: string, explicitPage?: number) => {
    if (!query.trim()) {
      dispatch({ type: "CLEAR_SEARCH" });

      return;
    }

    dispatch({ type: "FETCH_SEARCH_PAGE_START" });

    const page = explicitPage ?? state.searchCurrentPage + 1;

    try {
      const res = await fetch(
        `${BACKEND_URL}/movies/search?query=${encodeURIComponent(
          query
        )}&page=${page}`
      );
      if (!res.ok) throw new Error("Search failed");

      const data: MoviesResponse = await res.json();
      const movies = data.movies;
      const hasMore = movies.length > 0;

      dispatch({
        type: "FETCH_SEARCH_PAGE_SUCCESS",
        payload: { movies, page, hasMore },
      });
    } catch (error) {
      let message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_SEARCH_PAGE_ERROR",
        payload: await getErrorMessage(message),
      });
    }
  };

  const fetchReviewPage = async (movieId: number, explicitPage?: number) => {
    dispatch({ type: "FETCH_REVIEWS_PAGE_START", payload: { movieId } });

    const page = explicitPage ?? (state.reviewPages.get(movieId) ?? 0) + 1;

    try {
      const res = await fetch(
        `${BACKEND_URL}/movies/${movieId}/reviews?page=${page}`
      );

      if (!res.ok) throw new Error("Failed to fetch reviews");

      const data = await res.json();
      const reviews = data.reviews as Review[];
      const hasMore = reviews.length > 0;

      dispatch({
        type: "FETCH_REVIEWS_PAGE_SUCCESS",
        payload: { movieId, reviews, page, hasMore },
      });
    } catch (error) {
      const message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_REVIEWS_PAGE_ERROR",
        payload: { movieId, error: message },
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

  const getTrailer = (movieId: number) => state.trailers.get(movieId);
  const isTrailerLoading = (movieId: number) =>
    state.trailersLoading.get(movieId) ?? false;
  const trailerError = (movieId: number) =>
    state.trailersError.get(movieId) ?? null;

  const getCast = (id: number) => state.casts.get(id) ?? [];
  const isCastLoading = (id: number) => state.castsLoading.get(id) ?? false;
  const castError = (id: number) => state.castsError.get(id) ?? null;

  const contextValue: MoviesContextType = {
    state,
    fetchGenres,
    fetchPopularPage,
    fetchGenrePage,
    fetchMovieTrailer,
    fetchMovieCast,
    fetchReviewPage,
    setSearchQuery,
    fetchSearchPage,
    clearSearch,
    setFilters,
    resetFilters,
    getGenreName,
    getMoviesByGenre,
    getPopularMovies,
    getTrailer,
    isTrailerLoading,
    trailerError,
    getCast,
    isCastLoading,
    castError,
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
