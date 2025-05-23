// src/components/auth/ProtectedRoute.tsx
import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { state, fetchUserProfile } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      const token = localStorage.getItem("access_token");

      token
        ? fetchUserProfile()
        : navigate("/auth?mode=login", {
            replace: true,
            state: { from: location },
          });
    }
  }, [
    state.isAuthenticated,
    state.isLoading,
    fetchUserProfile,
    navigate,
    location,
  ]);

  if (state.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!state.isAuthenticated)
    return (
      <Navigate to="/auth?mode=login" replace state={{ from: location }} />
    );
  // Render the protected content if authenticated
  return <>{children}</>;
}
