import { LogIn, UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import { useAuthMode } from "../../hooks/useAuthMode";

export function AuthModeToggle() {
  const { isLogin, handleModeChange } = useAuthMode();

  return (
    <div className="lg:hidden px-2 pb-1">
      <div className="bg-muted rounded-lg p-0.5">
        <div className="grid w-full grid-cols-2">
          <Button
            variant={isLogin ? "default" : "ghost"}
            onClick={() => handleModeChange("login")}
            size="sm"
            className={`h-7 text-xs ${
              isLogin
                ? "bg-primary text-background"
                : "text-secondary hover:text-foreground"
            } transition-all duration-300`}
          >
            <LogIn className="w-3 h-3 mr-1" />
            Login
          </Button>
          <Button
            variant={!isLogin ? "default" : "ghost"}
            onClick={() => handleModeChange("signup")}
            size="sm"
            className={`h-7 text-xs ${
              !isLogin
                ? "bg-primary text-background"
                : "text-secondary hover:text-foreground"
            } transition-all duration-300`}
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
