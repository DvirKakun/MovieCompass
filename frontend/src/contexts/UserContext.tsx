// src/contexts/UserContext.tsx
import { useReducer, useCallback } from "react";
import type { ReactNode } from "react";
import type {
  ListKind,
  ProfileFieldError,
  ProfileUpdateResponse,
  UpdateUserProfile,
  UserAction,
  UserProfile,
  UserState,
} from "../types/user";
import { registerLogout } from "../api/logoutRegistry";
import { authFetch } from "../api/authFetch";
import { createContext, useContext } from "use-context-selector";
import type { Movie } from "../types/movies";
import { useMessages } from "./MessageContext";

// Initial state
const initialState: UserState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  listLoading: { watchlist: new Set(), favoriteMovies: new Set() },
  ratingLoading: new Set(),
  aiRecommendations: [],
  aiRecommendationsLoading: false,
  aiRecommendationsError: null,
  profileFieldErrors: [],
  profileUpdateLoading: false,
  profileUpdateSuccess: null,
};

// Reducer
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case "CLEAR_USER":
      return {
        ...initialState,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_LIST_LOADING": {
      const set = new Set(state.listLoading[action.list]);
      action.value ? set.add(action.movieId) : set.delete(action.movieId);
      return {
        ...state,
        listLoading: { ...state.listLoading, [action.list]: set },
      };
    }
    case "TOGGLE_MOVIE_IN_LIST": {
      if (!state.user) return state;

      const list = state.user[action.list];
      const exists = list.includes(action.movieId);
      const newList = exists
        ? list.filter((id) => id !== action.movieId)
        : [...list, action.movieId];

      return {
        ...state,
        user: { ...state.user, [action.list]: newList },
      };
    }
    case "REMOVE_FROM_WATCHLIST_SUCCESS":
      if (!state.user) return state;

      return {
        ...state,
        user: {
          ...state.user,
          watchlist: state.user.watchlist.filter((id) => id !== action.payload),
        },
      };
    case "SET_RATING_LOADING": {
      const set = new Set(state.ratingLoading);

      action.value ? set.add(action.movieId) : set.delete(action.movieId);

      return {
        ...state,
        ratingLoading: set,
      };
    }

    case "SET_MOVIE_RATING": {
      if (!state.user) return state;

      const existingRatingIndex = state.user.ratings.findIndex(
        (rating) => rating.movie_id === action.movieId
      );

      let newRatings = [...state.user.ratings];

      if (existingRatingIndex >= 0) {
        // Update existing rating
        newRatings[existingRatingIndex] = {
          ...newRatings[existingRatingIndex],
          rating: action.rating,
        };
      } else {
        // Add new rating
        newRatings.push({
          movie_id: action.movieId,
          rating: action.rating,
        });
      }

      return {
        ...state,
        user: {
          ...state.user,
          ratings: newRatings,
        },
      };
    }

    case "REMOVE_MOVIE_RATING": {
      if (!state.user) return state;

      return {
        ...state,
        user: {
          ...state.user,
          ratings: state.user.ratings.filter(
            (rating) => rating.movie_id !== action.movieId
          ),
        },
      };
    }

    // AI Recommendations actions
    case "FETCH_AI_RECOMMENDATIONS_START":
      return {
        ...state,
        aiRecommendationsLoading: true,
        aiRecommendationsError: null,
      };

    case "FETCH_AI_RECOMMENDATIONS_SUCCESS":
      return {
        ...state,
        aiRecommendations: action.payload,
        aiRecommendationsLoading: false,
        aiRecommendationsError: null,
      };

    case "FETCH_AI_RECOMMENDATIONS_ERROR":
      return {
        ...state,
        aiRecommendationsLoading: false,
        aiRecommendationsError: action.payload,
      };

    // Update profile actions
    case "UPDATE_PROFILE_START":
      return {
        ...state,
        profileUpdateLoading: true,
        profileFieldErrors: [],
        profileUpdateSuccess: null,
      };

    case "UPDATE_PROFILE_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        profileUpdateLoading: false,
        profileFieldErrors: [],
        profileUpdateSuccess: action.payload.message,
      };

    case "UPDATE_PROFILE_ERROR":
      return {
        ...state,
        profileUpdateLoading: false,
        profileFieldErrors: action.payload,
        profileUpdateSuccess: null,
      };

    case "STOP_PROFILE_UPDATE_LOADING":
      return {
        ...state,
        profileUpdateLoading: false,
      };

    case "CLEAR_PROFILE_MESSAGES":
      return {
        ...state,
        profileFieldErrors: [],
        profileUpdateSuccess: null,
      };

    default:
      return state;
  }
}

// Context
interface UserContextType {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  fetchUserProfile: () => Promise<void>;
  fetchAIRecommendations: () => Promise<void>;
  updateUserProfile: (profileData: UpdateUserProfile) => Promise<void>;
  logout: () => void;
  toggleToWatchlist: (id: number) => void;
  toggleToFavorite: (id: number) => void;
  removeFromWatchlist: (movieId: number) => Promise<void>;
  setMovieRating: (movieId: number, rating: number) => Promise<void>;
  removeMovieRating: (movieId: number) => Promise<void>;
  getUserRating: (movieId: number) => number | null;
  isRatingLoading: (movieId: number) => boolean;
  clearProfileMessages: () => void;
  getFieldError: (fieldName: string) => string | undefined;
}

const UserStateContext = createContext<UserState | undefined>(undefined);
const UserActionsContext = createContext<
  Omit<UserContextType, "state" | "dispatch"> | undefined
>(undefined);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { showError, showSuccess } = useMessages();

  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    dispatch({ type: "CLEAR_USER" });
  }, []);

  registerLogout(logout);

  // Fetch user profile with token
  const fetchUserProfile = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      /* authFetch throws + redirects if the token is bad */
      const res = await authFetch("/users/me");
      const raw = await res.json();

      const user: UserProfile = {
        id: raw.id,
        username: raw.username,
        firstName: raw.first_name,
        lastName: raw.last_name,
        email: raw.email,
        phoneNumber: raw.phone_number,
        authProvider: raw.auth_provider,
        favoriteMovies: raw.favorite_movies,
        watchlist: raw.watchlist,
        ratings: raw.ratings,
      };

      dispatch({ type: "SET_USER", payload: user });
    } catch (err: any) {
      // authFetch already handled token logout/redirect — only network errors reach here
      showError(err.message ?? "Network error. Please try again.");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const updateUserProfile = useCallback(
    async (profileData: UpdateUserProfile) => {
      if (!state.user) return;

      dispatch({ type: "UPDATE_PROFILE_START" });

      try {
        const response = await authFetch("/users/me", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        });

        if (!response.ok) {
          throw response; // This will be caught and processed below
        }

        const result: ProfileUpdateResponse = await response.json();
        const user_response = result.user;

        const updated_user: UserProfile = {
          id: user_response.id,
          username: user_response.username,
          firstName: user_response.first_name,
          lastName: user_response.last_name,
          email: user_response.email,
          phoneNumber: user_response.phone_number,
          authProvider: user_response.auth_provider,
          favoriteMovies: user_response.favorite_movies,
          watchlist: user_response.watchlist,
          ratings: user_response.ratings,
        };

        dispatch({
          type: "UPDATE_PROFILE_SUCCESS",
          payload: {
            user: updated_user,
            message: result.message,
          },
        });

        showSuccess(result.message);
      } catch (error: any) {
        if (error instanceof Response) {
          try {
            const errorData = await error.json();
            const errors: ProfileFieldError[] = errorData.errors || [
              { message: "Update failed" },
            ];
            const fieldErrors = errors.filter((error) => error.field);
            const generalError = errors.find((error) => !error.field);

            if (fieldErrors.length > 0) {
              dispatch({ type: "UPDATE_PROFILE_ERROR", payload: fieldErrors });
            }

            if (generalError) {
              showError(generalError.message);
            }
          } catch {
            showError("Network error occurred");
          }
        } else {
          showError("Update profile failed");
        }
      } finally {
        dispatch({ type: "STOP_PROFILE_UPDATE_LOADING" });
      }
    },
    [state.user]
  );

  // Fetch AI recommendations
  const fetchAIRecommendations = useCallback(async () => {
    if (!state.user) {
      dispatch({
        type: "FETCH_AI_RECOMMENDATIONS_ERROR",
        payload: "Please log in to get recommendations",
      });
      return;
    }

    dispatch({ type: "FETCH_AI_RECOMMENDATIONS_START" });

    try {
      const res = await authFetch("/users/me/recommendations", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch AI recommendations");
      }

      const data = await res.json();
      const movies: Movie[] = data.movies || [];

      dispatch({
        type: "FETCH_AI_RECOMMENDATIONS_SUCCESS",
        payload: movies,
      });
    } catch (err: any) {
      // authFetch already handled token logout/redirect — only network errors reach here
      const errorMessage =
        err.message ?? "Failed to fetch AI recommendations. Please try again.";

      dispatch({
        type: "FETCH_AI_RECOMMENDATIONS_ERROR",
        payload: errorMessage,
      });
    }
  }, [state.user]);

  async function toggleMovieOnServer(movieId: number, list: ListKind) {
    // optimistic UI
    dispatch({ type: "SET_LIST_LOADING", list, movieId, value: true });
    dispatch({ type: "TOGGLE_MOVIE_IN_LIST", list, movieId });

    /* decide HTTP verb AFTER the optimistic flip (that’s the new state) */
    const listAfter =
      list === "watchlist" ? state.user!.watchlist : state.user!.favoriteMovies;
    const verb = listAfter.includes(movieId) ? "DELETE" : "PUT";

    try {
      await authFetch(
        `/users/me/${
          list === "watchlist" ? "watchlist" : "favorite"
        }/${movieId}`,
        { method: verb }
      );
    } catch (err: any) {
      // authFetch has already logged-out on token failure; revert UI only if other error
      dispatch({ type: "TOGGLE_MOVIE_IN_LIST", list, movieId });

      showError("Failed to update");
    } finally {
      dispatch({ type: "SET_LIST_LOADING", list, movieId, value: false });
    }
  }

  const removeFromWatchlist = async (movieId: number) => {
    if (!state.user) return;

    const list: ListKind = "watchlist";

    // Add to loading state
    dispatch({ type: "SET_LIST_LOADING", list, movieId, value: true });

    try {
      await authFetch(`/users/me/watchlist/${movieId}`, {
        method: "DELETE",
      });

      // Update user state - remove movie from watchlist
      dispatch({
        type: "REMOVE_FROM_WATCHLIST_SUCCESS",
        payload: movieId,
      });
    } catch (error: any) {
      // Handle error - authFetch already handles token issues

      showError("Failed to remove from watchlist");
    } finally {
      // Remove from loading state
      dispatch({ type: "SET_LIST_LOADING", list, movieId, value: false });
    }
  };

  const setMovieRating = useCallback(
    async (movieId: number, rating: number) => {
      if (!state.user) return;

      // Set loading state
      dispatch({ type: "SET_RATING_LOADING", movieId, value: true });

      // Optimistic update
      dispatch({ type: "SET_MOVIE_RATING", movieId, rating });

      try {
        await authFetch(`/users/me/rating/${movieId}?rating=${rating}`, {
          method: "PUT",
        });
      } catch (err: any) {
        // Revert optimistic update on error
        const existingRating = state.user.ratings.find(
          (rating) => rating.movie_id === movieId
        );

        if (existingRating) {
          dispatch({
            type: "SET_MOVIE_RATING",
            movieId,
            rating: existingRating.rating,
          });
        } else {
          dispatch({ type: "REMOVE_MOVIE_RATING", movieId });
        }

        showError("Failed to save rating");
      } finally {
        dispatch({ type: "SET_RATING_LOADING", movieId, value: false });
      }
    },
    [state.user]
  );

  const removeMovieRating = useCallback(
    async (movieId: number) => {
      if (!state.user) return;

      const existingRating = state.user.ratings.find(
        (rating) => rating.movie_id === movieId
      );

      if (!existingRating) return;

      // Set loading state
      dispatch({ type: "SET_RATING_LOADING", movieId, value: true });

      // Optimistic update
      dispatch({ type: "REMOVE_MOVIE_RATING", movieId });

      try {
        await authFetch(`/users/me/rating/${movieId}`, {
          method: "DELETE",
        });
      } catch (err: any) {
        // Revert optimistic update on error
        dispatch({
          type: "SET_MOVIE_RATING",
          movieId,
          rating: existingRating.rating,
        });

        showError("Failed to remove rating");
      } finally {
        dispatch({ type: "SET_RATING_LOADING", movieId, value: false });
      }
    },
    [state.user]
  );

  const getUserRating = useCallback(
    (movieId: number): number | null => {
      if (!state.user) return null;

      const rating = state.user.ratings.find(
        (rating) => rating.movie_id === movieId
      );

      return rating ? rating.rating : null;
    },
    [state.user]
  );

  const isRatingLoading = useCallback(
    (movieId: number): boolean => {
      return state.ratingLoading.has(movieId);
    },
    [state.ratingLoading]
  );

  const toggleToWatchlist = (id: number) =>
    toggleMovieOnServer(id, "watchlist");
  const toggleToFavorite = (id: number) =>
    toggleMovieOnServer(id, "favoriteMovies");

  const clearProfileMessages = useCallback(() => {
    dispatch({ type: "CLEAR_PROFILE_MESSAGES" });
  }, []);

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      console.log(state.profileFieldErrors);
      return state.profileFieldErrors.find((err) => err.field === fieldName)
        ?.message;
    },
    [state.profileFieldErrors]
  );

  return (
    <UserStateContext.Provider value={state}>
      <UserActionsContext.Provider
        value={{
          fetchUserProfile,
          fetchAIRecommendations,
          updateUserProfile,
          logout,
          toggleToWatchlist,
          toggleToFavorite,
          removeFromWatchlist,
          setMovieRating,
          removeMovieRating,
          getUserRating,
          isRatingLoading,
          clearProfileMessages,
          getFieldError,
        }}
      >
        {children}
      </UserActionsContext.Provider>
    </UserStateContext.Provider>
  );
}

// Custom hook to use the user context
export function useUserState() {
  const context = useContext(UserStateContext);

  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

export function useUserActions() {
  const context = useContext(UserActionsContext);

  if (context === undefined) {
    throw new Error("useUserActions must be used within a UserProvider");
  }
  return context;
}
