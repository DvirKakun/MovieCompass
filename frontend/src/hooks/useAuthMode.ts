import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function useAuthMode() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, dispatch } = useAuth();

  // Initialize form mode based on URL params
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      dispatch({ type: "SET_MODE", payload: false });
    } else {
      dispatch({ type: "SET_MODE", payload: true });
    }
  }, [searchParams, dispatch]);

  const handleModeChange = (newMode: "login" | "signup") => {
    const isLogin = newMode === "login";
    const direction = newMode === "signup" ? 1 : -1;

    dispatch({ type: "SET_DIRECTION", payload: direction });
    dispatch({ type: "SET_MODE", payload: isLogin });
    dispatch({ type: "CLEAR_MESSAGES" });

    setSearchParams({ mode: newMode });
  };

  return {
    isLogin: state.isLogin,
    direction: state.direction,
    handleModeChange,
  };
}
