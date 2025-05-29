import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function RouteChangeMessageClearer() {
  const location = useLocation();
  const { dispatch } = useAuth();

  useEffect(() => {
    // Clear auth messages when route changes
    dispatch({ type: "CLEAR_MESSAGES" });
  }, [location.pathname, dispatch]);

  return null;
}
