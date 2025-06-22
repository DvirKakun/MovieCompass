import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  CastMember,
  GenreResponse,
  Movie,
  MoviesAction,
  MoviesResponse,
  MoviesState,
  Review,
  TorrentResponse,
  TorrentResult,
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

  casts: new Map(),
  castsLoading: new Map(),
  castsError: new Map(),

  reviews: new Map(),
  reviewsLoading: new Map(),
  reviewsError: new Map(),
  reviewPages: new Map(),
  reviewHasMore: new Map(),

  fetchedMoviesById: new Map(),
  fetchedMoviesLoading: false,
  fetchedMoviesError: null,

  torrents: new Map(),
  torrentsLoading: new Map(),
  torrentsError: new Map(),
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

    // Popular Movies
    case "FETCH_POPULAR_PAGE_START":
      return { ...state, popularLoading: true, popularError: null };

    case "FETCH_POPULAR_PAGE_SUCCESS": {
      const { movies, page, hasMore } = action.payload;

      // Deduplicate movies
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

    // Genre Movies
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

    // Cast
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

    // Movies by ID
    case "FETCH_MOVIES_BY_IDS_START":
      return { ...state, fetchedMoviesLoading: true, fetchedMoviesError: null };

    case "FETCH_MOVIES_BY_IDS_SUCCESS":
      return {
        ...state,
        fetchedMoviesById: action.payload,
        fetchedMoviesLoading: false,
      };

    case "FETCH_MOVIES_BY_IDS_ERROR":
      return {
        ...state,
        fetchedMoviesLoading: false,
        fetchedMoviesError: action.payload,
      };

    // Torrents
    case "FETCH_TORRENTS_START": {
      const { movieId } = action.payload;
      const torrentsLoading = new Map(state.torrentsLoading).set(movieId, true);
      const torrentsError = new Map(state.torrentsError);

      torrentsError.delete(movieId);

      return {
        ...state,
        torrentsLoading,
        torrentsError,
      };
    }

    case "FETCH_TORRENTS_SUCCESS": {
      const { movieId, torrents } = action.payload;
      const torrentsMap = new Map(state.torrents).set(movieId, torrents);
      const torrentsLoading = new Map(state.torrentsLoading).set(
        movieId,
        false
      );

      return {
        ...state,
        torrents: torrentsMap,
        torrentsLoading,
      };
    }

    case "FETCH_TORRENTS_ERROR": {
      const { movieId, error } = action.payload;
      const torrentsLoading = new Map(state.torrentsLoading).set(
        movieId,
        false
      );
      const torrentsError = new Map(state.torrentsError).set(movieId, error);

      return {
        ...state,
        torrentsLoading,
        torrentsError,
      };
    }

    default:
      return state;
  }
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

  // Movie actions
  fetchGenrePage: (genreId: number, explicitPage?: number) => Promise<void>;
  fetchPopularPage: (explicitPage?: number) => Promise<void>;

  // Cast actions
  fetchMovieCast: (id: number) => Promise<void>;

  // Reviews actions
  fetchReviewPage: (movieId: number, explicitPage?: number) => Promise<void>;

  // Movies by ID actions
  fetchMoviesByIds: (ids: number[]) => Promise<void>;

  // Search actions
  setSearchQuery: (query: string) => void;
  fetchSearchPage: (query: string, explicitPage?: number) => Promise<void>;
  clearSearch: () => void;

  // Torrent actions
  fetchTorrents: (movie: Movie) => Promise<void>;

  // Helper functions
  getGenreName: (genreId: number) => string;
  getMoviesByGenre: (genreId: number) => Movie[];
  getPopularMovies: () => Movie[];
  getMovieById: (id: number) => Movie | undefined;
  getCast: (id: number) => CastMember[];
  isCastLoading: (id: number) => boolean;
  castError: (id: number) => string | null;

  getTorrents: (movieId: number) => TorrentResult[];
  isTorrentsLoading: (movieId: number) => boolean;
  getTorrentsError: (movieId: number) => string | null;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

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

  // Genre movies actions
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

  // Popular movies actions
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

  // Cast actions
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
        payload: message,
      });
    }
  };

  const clearSearch = () => {
    dispatch({ type: "CLEAR_SEARCH" });
  };

  // Reviews actions
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

  // Movies by ID actions
  const fetchMoviesByIds = useCallback(
    async (ids: number[]) => {
      // Remove IDs we already have
      const idsToFetch = ids.filter((id) => !state.fetchedMoviesById.has(id));
      if (idsToFetch.length === 0) return;

      dispatch({ type: "FETCH_MOVIES_BY_IDS_START" });

      try {
        const params = new URLSearchParams();
        idsToFetch.forEach((id) => params.append("ids", id.toString()));

        const res = await fetch(`${BACKEND_URL}/movies?${params.toString()}`);

        if (!res.ok) throw new Error("Failed to fetch movie details");

        const movies: Movie[] = await res.json();

        // Merge into a new Map to keep ref stable
        const merged = new Map(state.fetchedMoviesById);
        movies.forEach((movie) => merged.set(movie.id, movie));

        dispatch({ type: "FETCH_MOVIES_BY_IDS_SUCCESS", payload: merged });
      } catch (error) {
        const message = await getErrorMessage(error);
        dispatch({
          type: "FETCH_MOVIES_BY_IDS_ERROR",
          payload: message,
        });
      }
    },
    [state.fetchedMoviesById]
  );

  // Torrent actions
  const fetchTorrents = async (movie: Movie) => {
    if (state.torrents.has(movie.id) || state.torrentsLoading.get(movie.id)) {
      return;
    }

    dispatch({ type: "FETCH_TORRENTS_START", payload: { movieId: movie.id } });

    try {
      const encodedMovieName = encodeURIComponent(movie.title);
      const res = await fetch(
        `http://localhost:8009/api/v1/all/search?query=${encodedMovieName}&limit=0`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch torrents");
      }

      const data: TorrentResponse = await res.json();

      // Ensure data.data is an array and handle missing fields with fallbacks
      const torrents = Array.isArray(data.data) ? data.data : [];

      // Map the response to only include the fields we need with safe defaults
      const mappedTorrents: TorrentResult[] = torrents.map((torrent: any) => ({
        name: torrent.name || "Unknown",
        size: torrent.size || "Unknown",
        seeders: torrent.seeders || "0",
        leechers: torrent.leechers || "0",
        category: torrent.category || "Unknown",
        magnet: torrent.magnet || "",
        torrent: torrent.torrent || "",
        url: torrent.url || "",
        date: torrent.date || "Unknown",
        downloads: torrent.downloads || "0",
      }));

      dispatch({
        type: "FETCH_TORRENTS_SUCCESS",
        payload: { movieId: movie.id, torrents: mappedTorrents },
      });
    } catch (error) {
      let message = await getErrorMessage(error);

      dispatch({
        type: "FETCH_TORRENTS_ERROR",
        payload: { movieId: movie.id, error: message },
      });
    }
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

  const getMovieById = (id: number) => state.fetchedMoviesById.get(id);

  const getCast = (id: number) => state.casts.get(id) ?? [];
  const isCastLoading = (id: number) => state.castsLoading.get(id) ?? false;
  const castError = (id: number) => state.castsError.get(id) ?? null;

  const getTorrents = (movieId: number) => state.torrents.get(movieId) ?? [];
  const isTorrentsLoading = (movieId: number) =>
    state.torrentsLoading.get(movieId) ?? false;
  const getTorrentsError = (movieId: number) =>
    state.torrentsError.get(movieId) ?? null;

  const contextValue: MoviesContextType = useMemo(
    () => ({
      state,
      fetchGenres,
      fetchPopularPage,
      fetchGenrePage,
      fetchMovieCast,
      fetchReviewPage,
      fetchTorrents,
      setSearchQuery,
      fetchSearchPage,
      clearSearch,
      getGenreName,
      getMoviesByGenre,
      getPopularMovies,
      getCast,
      isCastLoading,
      castError,
      fetchMoviesByIds,
      getMovieById,
      getTorrents,
      isTorrentsLoading,
      getTorrentsError,
    }),
    [state, fetchMoviesByIds]
  );

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
