// src/pages/AuthPage.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { AuthProvider } from "../contexts/AuthContext";
import { AuthHeader } from "../components/auth/AuthHeader";
import { AuthMessages } from "../components/auth/AuthMessages";
import { AuthSidebar } from "../components/auth/AuthSidebar";
import { AuthFormSection } from "../components/sections/AuthFormSection";

export default function AuthPage() {
  const { state, fetchUserProfile } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  /* ①  Fetch the profile **once** but only when a token is present.  */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) fetchUserProfile(); // ← no token ⇒ no network call
  }, [fetchUserProfile]);

  /* ②  When the user becomes authenticated, go to the dashboard.     */
  useEffect(() => {
    if (state.isAuthenticated) navigate("/dashboard", { replace: true });
  }, [state.isAuthenticated, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get("msg");
    if (msg) {
      // Optional: Dispatch an error to UserContext or use a flash context
      state.error = msg; // Direct assignment if you want fast feedback
    }
  }, [location.search]);

  /* ③  Loading spinner while we *might* still be restoring a session. */
  if (state.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  /* ④  No token or token failed → show login / signup UI. */
  return (
    <AuthProvider>
      <div className="h-screen bg-background overflow-hidden">
        <AuthHeader />
        <AuthMessages /> {/* shows state.error like “session expired” */}
        <div className="h-full flex">
          <AuthSidebar />
          <AuthFormSection />
        </div>
      </div>
    </AuthProvider>
  );
}
