import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useUserState, useUserActions } from "../../contexts/UserContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useUserState();
  const { fetchUserProfile } = useUserActions();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      const token = localStorage.getItem("access_token");

      token
        ? fetchUserProfile()
        : navigate("/auth?mode=login", {
            replace: true,
            state: { from: location },
          });
    }
  }, [isAuthenticated, isLoading, fetchUserProfile, navigate, location]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/auth?mode=login" replace state={{ from: location }} />
    );
  }

  return <>{children}</>;
}
