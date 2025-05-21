// src/contexts/UserContext.tsx
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../data/constants";
import { Speaker } from "lucide-react";

interface UserApiResponse {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  favorite_movies: [];
  watchlist: [];
  ratings: [];
}

interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  favoriteMovies: [];
  watchlist: [];
  ratings: [];
}

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

type UserAction =
  | { type: "SET_USER"; payload: UserProfile }
  | { type: "CLEAR_USER" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// Initial state
const initialState: UserState = {
  user: null,
  isLoading: false, // Start with loading to show spinner initially
  error: null,
  isAuthenticated: false,
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const navigate = useNavigate();

  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    dispatch({ type: "CLEAR_USER" });

    // const url = "/auth?mode=login";

    // navigate(url);
  }, []); //, [navigate])

  // Fetch user profile with token
  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "CLEAR_USER" });

      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await fetch(`${BACKEND_URL}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const rawData = await response.json();

      if (!response.ok) {
        logout();

        const tokenError = rawData.errors[0].field === "token";

        if (tokenError) {
          dispatch({
            type: "SET_ERROR",
            payload: "Your session has expired. Please log in again.",
          });
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: "An unknown error occurred",
          });
        }

        return;
      }

      const userData: UserProfile = {
        id: rawData.id,
        username: rawData.username,
        firstName: rawData.first_name,
        lastName: rawData.last_name,
        email: rawData.email,
        favoriteMovies: rawData.favorite_movies,
        watchlist: rawData.watchlist,
        ratings: rawData.ratings,
      };

      dispatch({ type: "SET_USER", payload: userData });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Network error. Please try again.",
      });
    }
  }, [logout]);

  return (
    <UserContext.Provider value={{ state, dispatch, fetchUserProfile, logout }}>
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
