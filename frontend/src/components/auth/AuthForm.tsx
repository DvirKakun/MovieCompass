import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthSubmit } from "../../hooks/useAuthSubmit";
import { AuthFormFields } from "./AuthFormFields";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthVerificationAlert } from "./AuthVerificationAlert";
import { GoogleAuthButton } from "./GoogleAuthButton";

export function AuthForm() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { handleSubmit } = useAuthSubmit();

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <AuthVerificationAlert show={!!state.errors.verification} />
      <AuthFormFields />
      <AuthSubmitButton />

      {state.isLogin && (
        <div className="text-center pt-1">
          <Button
            variant="link"
            className="text-primary hover:text-primary/80 text-xs h-auto p-0"
            onClick={() => navigate("/auth/forgot-password")}
          >
            Forgot your password?
          </Button>
        </div>
      )}

      <GoogleAuthButton isLogin={state.isLogin} className="mt-4" />
    </form>
  );
}
