export interface Rating {
  movie_id: number;
  rating: number;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  favoriteMovies: number[];
  watchlist: number[];
  ratings: Rating[];
}

export interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  listLoading: Record<ListKind, Set<number>>;
}

export type ListKind = "watchlist" | "favoriteMovies";

export type UserAction =
  | { type: "SET_USER"; payload: UserProfile }
  | { type: "CLEAR_USER" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "SET_LIST_LOADING";
      list: ListKind;
      movieId: number;
      value: boolean;
    }
  | { type: "TOGGLE_MOVIE_IN_LIST"; list: ListKind; movieId: number }
  | { type: "REMOVE_FROM_WATCHLIST_SUCCESS"; payload: number };
