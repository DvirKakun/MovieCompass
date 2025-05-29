// src/pages/AuthPage.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthHeader } from "../components/auth/AuthHeader";
import { AuthMessages } from "../components/auth/AuthMessages";
import { AuthSidebar } from "../components/auth/AuthSidebar";
import { AuthFormSection } from "../components/home/AuthFormSection";
import { useUserActions, useUserState } from "../contexts/UserContext";

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useUserState();
  const { fetchUserProfile, setError } = useUserActions();
  const navigate = useNavigate();
  const location = useLocation();

  /* ①  Fetch the profile **once** but only when a token is present.  */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) fetchUserProfile(); // ← no token ⇒ no network call
  }, [fetchUserProfile]);

  /* ②  When the user becomes authenticated, go to the dashboard.     */
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get("msg");
    if (msg) {
      setError(msg);
    }
  }, [location.search]);

  /* ③  Loading spinner while we *might* still be restoring a session. */
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  /* ④  No token or token failed → show login / signup UI. */
  return (
    <div className="h-screen bg-background overflow-hidden">
      <AuthHeader />
      <AuthMessages /> {/* shows state.error like “session expired” */}
      <div className="h-full flex">
        <AuthSidebar />
        <AuthFormSection />
      </div>
    </div>
  );
}
