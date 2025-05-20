import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function GoogleCallbackHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token from URL hash fragment
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get("access_token");

    if (token) {
      // Store the token in localStorage
      localStorage.setItem("access_token", token);

      // Redirect to dashboard
      setTimeout(() => navigate("/dashboard"), 0);
    } else {
      // Handle error case - no token found
      setTimeout(
        () => navigate("/auth?mode=login&error=authentication_failed"),
        0
      );
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">
          Completing Authentication
        </h2>
        <p className="text-sm text-secondary">
          Please wait while we redirect you...
        </p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-b-transparent"></div>
        </div>
      </div>
    </div>
  );
}
