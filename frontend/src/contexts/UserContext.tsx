// src/contexts/UserContext.tsx
import { useReducer, useCallback } from "react";
import type { ReactNode } from "react";
import type {
  ListKind,
  UserAction,
  UserProfile,
  UserState,
} from "../types/user";
import { registerLogout } from "../api/logoutRegistry";
import { authFetch } from "../api/authFetch";
import { createContext, useContext } from "use-context-selector";

// Initial state
const initialState: UserState = {
  user: null,
  isLoading: false, // Start with loading to show spinner initially
  error: null,
  isAuthenticated: false,
  listLoading: { watchlist: new Set(), favoriteMovies: new Set() },
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
        error: null,
      };
    case "CLEAR_USER":
      return {
        ...initialState,
        isLoading: false, // Not loading after clearing
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
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
    default:
      return state;
  }
}

// Context
interface UserContextType {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  fetchUserProfile: () => Promise<void>;
  logout: () => void;
  toggleToWatchlist: (id: number) => void;
  toggleToFavorite: (id: number) => void;
  removeFromWatchlist: (movieId: number) => Promise<void>;
  setError: (message: string) => void;
}

const UserStateContext = createContext<UserState | undefined>(undefined);
const UserActionsContext = createContext<
  Omit<UserContextType, "state" | "dispatch"> | undefined
>(undefined);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    dispatch({ type: "CLEAR_USER" });
  }, []);

  const setError = useCallback((message: string) => {
    dispatch({ type: "SET_ERROR", payload: message });
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
        favoriteMovies: raw.favorite_movies,
        watchlist: raw.watchlist,
        ratings: raw.ratings,
      };

      dispatch({ type: "SET_USER", payload: user });
    } catch (err: any) {
      // authFetch already handled token logout/redirect — only network errors reach here
      dispatch({
        type: "SET_ERROR",
        payload: err.message ?? "Network error. Please try again.",
      });
    }
  }, []);

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
      dispatch({
        type: "SET_ERROR",
        payload: err.message ?? "Could not update list",
      });
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
    } catch (error) {
      // Handle error - authFetch already handles token issues
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to remove from watchlist",
      });
    } finally {
      // Remove from loading state
      dispatch({ type: "SET_LIST_LOADING", list, movieId, value: false });
    }
  };
  const toggleToWatchlist = (id: number) =>
    toggleMovieOnServer(id, "watchlist");
  const toggleToFavorite = (id: number) =>
    toggleMovieOnServer(id, "favoriteMovies");

  return (
    <UserStateContext.Provider value={state}>
      <UserActionsContext.Provider
        value={{
          fetchUserProfile,
          logout,
          setError,
          toggleToWatchlist,
          toggleToFavorite,
          removeFromWatchlist,
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
