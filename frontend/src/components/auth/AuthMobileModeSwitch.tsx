import { Button } from "../ui/button";
import { useAuthMode } from "../../hooks/useAuthMode";

export function AuthMobileModeSwitch() {
  const { isLogin, handleModeChange } = useAuthMode();

  return (
    <div className="lg:hidden text-center mt-3">
      <p className="text-xs text-muted-foreground mb-1">
        {isLogin ? "New to MovieCompass?" : "Already have an account?"}
      </p>
      <Button
        variant="link"
        onClick={() => handleModeChange(isLogin ? "signup" : "login")}
        className="text-primary hover:text-primary/80 text-xs h-auto p-0"
      >
        {isLogin ? "Create Account" : "Login"}
      </Button>
    </div>
  );
}
