import type { Movie } from "./movies";

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
  phoneNumber: string;
  authProvider: string;
  favoriteMovies: number[];
  watchlist: number[];
  ratings: Rating[];
}

export interface UpdateUserProfile {
  username?: string;
  old_password?: string;
  new_password?: string;
  new_password_confirm?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  new_email?: string;
}

export interface ProfileUpdateResponse {
  user: any;
  message: string;
}

export interface ProfileFieldError {
  field?: string;
  message: string;
}

export interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  listLoading: Record<ListKind, Set<number>>;
  ratingLoading: Set<number>;
  aiRecommendations: Movie[];
  aiRecommendationsLoading: boolean;
  aiRecommendationsError: string | null;
  profileUpdateLoading: boolean;
  profileFieldErrors: ProfileFieldError[];
  profileUpdateSuccess: string | null;
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
  | { type: "REMOVE_FROM_WATCHLIST_SUCCESS"; payload: number }
  | { type: "SET_RATING_LOADING"; movieId: number; value: boolean }
  | { type: "SET_MOVIE_RATING"; movieId: number; rating: number }
  | { type: "REMOVE_MOVIE_RATING"; movieId: number }
  | { type: "FETCH_AI_RECOMMENDATIONS_START" }
  | { type: "FETCH_AI_RECOMMENDATIONS_SUCCESS"; payload: Movie[] }
  | { type: "FETCH_AI_RECOMMENDATIONS_ERROR"; payload: string }
  | { type: "UPDATE_PROFILE_START" }
  | {
      type: "UPDATE_PROFILE_SUCCESS";
      payload: { user: UserProfile; message: string };
    }
  | { type: "UPDATE_PROFILE_ERROR"; payload: ProfileFieldError[] }
  | { type: "CLEAR_PROFILE_MESSAGES" };
