export interface Genre {
  id: number;
  name: string;
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

export interface MoviesState {
  // Genres
  genres: Genre[];
  genreMap: Map<number, string>;
  genresLoading: boolean;
  genresError: string | null;

  popularMovies: Movie[];
  popularLoading: boolean;
  popularError: string | null;

  // Movie rollers by genre
  moviesByGenre: Map<number, Movie[]>;
  rollersLoading: boolean;
  rollersError: string | null;

  // Search
  searchQuery: string;
  searchResults: Movie[];
  searchLoading: boolean;
  searchError: string | null;

  // Filters
  filters: MovieFilters;
  filteredResults: Movie[];
}

export type MoviesAction =
  // Genres actions
  | { type: "FETCH_GENRES_START" }
  | { type: "FETCH_GENRES_SUCCESS"; payload: Genre[] }
  | { type: "FETCH_GENRES_ERROR"; payload: string }

  // Popular movies actions
  | { type: "FETCH_POPULAR_START" }
  | { type: "FETCH_POPULAR_SUCCESS"; payload: Movie[] }
  | { type: "FETCH_POPULAR_ERROR"; payload: string }

  // Movie rollers actions
  | { type: "FETCH_ROLLERS_START" }
  | {
      type: "FETCH_ROLLERS_SUCCESS";
      payload: { genreId: number; movies: Movie[] };
    }
  | { type: "FETCH_ROLLERS_ERROR"; payload: string }

  // Search actions
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "FETCH_SEARCH_START" }
  | { type: "FETCH_SEARCH_SUCCESS"; payload: Movie[] }
  | { type: "FETCH_SEARCH_ERROR"; payload: string }
  | { type: "CLEAR_SEARCH" }

  // Filter actions
  | { type: "SET_FILTERS"; payload: Partial<MovieFilters> }
  | { type: "RESET_FILTERS" }
  | { type: "APPLY_FILTERS" };
