export interface Genre {
  id: number;
  name: string;
}

export interface Review {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface GenreResponse {
  genres: Genre[];
}
export interface MoviesResponse {
  movies: Movie[];
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[] | null;
  genres: Genre[] | null;
  popularity: number;
}

export interface MovieFilters {
  genre: number | null;
  minRating: number | null;
  maxRating: number | null;
  minYear: number | null;
  maxYear: number | null;
}

export interface MovieTrailer {
  movie_id: number;
  title: string | null;
  embed_url: string | null;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MoviesState {
  // Genres
  genres: Genre[];
  genreMap: Map<number, string>;
  genresLoading: boolean;
  genresError: string | null;

  popularMovies: Movie[];
  popularLoading: boolean;
  popularError: string | null;
  popularCurrentPage: number;
  popularHasMore: boolean;

  // Movie rollers by genre
  moviesByGenre: Map<number, Movie[]>;
  pagesByGenre: Map<number, number>;
  hasMoreByGenre: Map<number, boolean>;
  moviesLoading: boolean;
  moviesError: string | null;

  // Search
  searchQuery: string;
  searchResults: Movie[];
  searchLoading: boolean;
  searchError: string | null;
  searchHasMore: boolean;
  searchCurrentPage: number;

  // Cast
  casts: Map<number, CastMember[]>;
  castsLoading: Map<number, boolean>;
  castsError: Map<number, string>;

  // Reviews
  reviews: Map<number, Review[]>;
  reviewsLoading: Map<number, boolean>;
  reviewsError: Map<number, string | null>;
  reviewPages: Map<number, number>;
  reviewHasMore: Map<number, boolean>;

  // Movies by id
  fetchedMoviesById: Map<number, Movie>;
  fetchedMoviesLoading: boolean;
  fetchedMoviesError: string | null;
}

export type MoviesAction =
  // Genres actions
  | { type: "FETCH_GENRES_START" }
  | { type: "FETCH_GENRES_SUCCESS"; payload: Genre[] }
  | { type: "FETCH_GENRES_ERROR"; payload: string }

  // Popular movies actions
  | { type: "FETCH_POPULAR_PAGE_START" }
  | {
      type: "FETCH_POPULAR_PAGE_SUCCESS";
      payload: { movies: Movie[]; page: number; hasMore: boolean };
    }
  | { type: "FETCH_POPULAR_PAGE_ERROR"; payload: string }

  // Fetch more movies for infinit scroll
  | {
      type: "FETCH_MORE_MOVIES_SUCCESS";
      payload: { genreId: number; movies: Movie[] };
    }

  // Movies actions
  | { type: "FETCH_GENRE_PAGE_START" }
  | {
      type: "FETCH_GENRE_PAGE_SUCCESS";
      payload: {
        genreId: number;
        page: number;
        movies: Movie[];
        hasMore: boolean;
      };
    }
  | { type: "FETCH_GENRE_PAGE_ERROR"; payload: string }

  // Search actions
  | { type: "FETCH_SEARCH_PAGE_START" }
  | {
      type: "FETCH_SEARCH_PAGE_SUCCESS";
      payload: { movies: Movie[]; page: number; hasMore: boolean };
    }
  | { type: "FETCH_SEARCH_PAGE_ERROR"; payload: string }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "CLEAR_SEARCH" }

  // Filter actions
  | { type: "SET_FILTERS"; payload: Partial<MovieFilters> }
  | { type: "RESET_FILTERS" }
  | { type: "APPLY_FILTERS" }

  // Trailers actions
  | { type: "FETCH_TRAILER_START"; payload: { movieId: number } }
  | {
      type: "FETCH_TRAILER_SUCCESS";
      payload: { movieId: number; trailer: MovieTrailer };
    }
  | {
      type: "FETCH_TRAILER_ERROR";
      payload: { movieId: number; error: string };
    }

  // Cast actions
  | { type: "FETCH_CAST_START"; payload: { movieId: number } }
  | {
      type: "FETCH_CAST_SUCCESS";
      payload: { movieId: number; cast: CastMember[] };
    }
  | { type: "FETCH_CAST_ERROR"; payload: { movieId: number; error: string } }

  // Reviews actions
  | { type: "FETCH_REVIEWS_PAGE_START"; payload: { movieId: number } }
  | {
      type: "FETCH_REVIEWS_PAGE_SUCCESS";
      payload: {
        movieId: number;
        reviews: Review[];
        page: number;
        hasMore: boolean;
      };
    }
  | {
      type: "FETCH_REVIEWS_PAGE_ERROR";
      payload: { movieId: number; error: string };
    }

  // Movies by id actions
  | { type: "FETCH_MOVIES_BY_IDS_START" }
  | { type: "FETCH_MOVIES_BY_IDS_SUCCESS"; payload: Map<number, Movie> }
  | { type: "FETCH_MOVIES_BY_IDS_ERROR"; payload: string };
