// src/components/auth/ProtectedRoute.tsx
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { state, fetchUserProfile } = useUser();
  const navigate = useNavigate();
  console.log(state);
  // Show loading spinner while checking authentication

  useEffect(() => {
    if (!state.isAuthenticated) {
      fetchUserProfile();
    }
  }, [state.isAuthenticated, fetchUserProfile]);

  if (state.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    navigate("/auth?mode=login");

    return null;
  }
  // Render the protected content if authenticated
  return <>{children}</>;
}
