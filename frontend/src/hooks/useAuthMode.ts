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

    const errorCode = searchParams.get("error");

    if (errorCode) {
      dispatch({
        type: "SET_ERRORS",
        payload: { general: "An error occurred. Please try again." },
      });

      // Remove the error parameter from URL to prevent showing the error again on refresh
      searchParams.delete("error");
      setSearchParams(searchParams);
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
