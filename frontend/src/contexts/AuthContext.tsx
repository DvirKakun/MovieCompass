import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import type { AuthState, AuthAction } from "../types/auth";

const initialState: AuthState = {
  isLogin: true,
  showPassword: false,
  showConfirmPassword: false,
  isLoading: false,
  errors: {},
  successMessage: "",
  direction: 0,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, isLogin: action.payload };
    case "TOGGLE_PASSWORD_VISIBILITY":
      return { ...state, showPassword: !state.showPassword };
    case "TOGGLE_CONFIRM_PASSWORD_VISIBILITY":
      return { ...state, showConfirmPassword: !state.showConfirmPassword };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "SET_SUCCESS_MESSAGE":
      return { ...state, successMessage: action.payload };
    case "SET_DIRECTION":
      return { ...state, direction: action.payload };
    case "CLEAR_MESSAGES":
      return { ...state, errors: {}, successMessage: "" };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
