// src/contexts/UserContext.tsx
import { createContext, useContext, useReducer, useCallback } from "react";
import type { ReactNode } from "react";
import { BACKEND_URL } from "../data/constants";
import type {
  ListKind,
  UserAction,
  UserProfile,
  UserState,
} from "../types/user";
import { registerLogout } from "../api/logoutRegistry";
import { authFetch } from "../api/authFetch";

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
  addToWatchlist: (id: number) => void;
  addToFavorite: (id: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

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

  const addToWatchlist = (id: number) => toggleMovieOnServer(id, "watchlist");
  const addToFavorite = (id: number) =>
    toggleMovieOnServer(id, "favoriteMovies");

  return (
    <UserContext.Provider
      value={{
        state,
        dispatch,
        fetchUserProfile,
        logout,
        addToWatchlist,
        addToFavorite,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
