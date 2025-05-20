// src/contexts/UserContext.tsx
import { api, registerLogoutHandler } from "../utils/authFetch";
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface UserApiResponse {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
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
  isLoading: true, // Start with loading to show spinner initially
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

  // Fetch user profile with token
  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      dispatch({ type: "CLEAR_USER" });

      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const rawData = await api.get<UserApiResponse>("/users/me");

      const userData: UserProfile = {
        id: rawData.id,
        username: rawData.username,
        firstName: rawData.first_name,
        lastName: rawData.last_name,
        email: rawData.email,
      };

      dispatch({ type: "SET_USER", payload: userData });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }, [navigate]);

  // Check token and fetch user data on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      fetchUserProfile();
    } else {
      // No token, so we're not loading anymore
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [fetchUserProfile]);

  // Logout user
  const logout = useCallback(
    (error: string | null = null) => {
      localStorage.removeItem("access_token");
      dispatch({ type: "CLEAR_USER" });

      const url = error
        ? `/auth?mode=login&error=${encodeURIComponent(error)}`
        : `/auth?mode=login`;

      navigate(url);
    },
    [navigate]
  );

  useEffect(() => {
    registerLogoutHandler(logout);
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
