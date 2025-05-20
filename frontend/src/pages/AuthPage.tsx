import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { AuthProvider } from "../contexts/AuthContext";
import { AuthHeader } from "../components/auth/AuthHeader";
import { AuthMessages } from "../components/auth/AuthMessages";
import { AuthSidebar } from "../components/auth/AuthSidebar";
import { AuthFormSection } from "../components/sections/AuthFormSection";

export default function AuthPage() {
  const { state, fetchUserProfile } = useUser();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [state.isAuthenticated, navigate]);

  // If still checking authentication, show loading
  if (state.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Otherwise show login/signup form
  return (
    <AuthProvider>
      <div className="h-screen bg-background overflow-hidden">
        <AuthHeader />
        <AuthMessages />

        {/* Main Content */}
        <div className="h-full flex">
          <AuthSidebar />
          <AuthFormSection />
        </div>
      </div>
    </AuthProvider>
  );
}
