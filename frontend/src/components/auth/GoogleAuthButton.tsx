import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { BACKEND_URL } from "../../data/constants";

interface GoogleAuthButtonProps {
  isLogin: boolean;
  className?: string;
}

export function GoogleAuthButton({
  isLogin,
  className = "",
}: GoogleAuthButtonProps) {
  const handleGoogleAuth = () => {
    window.location.href = `${BACKEND_URL}/auth/google/login`;
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-3 my-2">
        <Separator className="flex-1 bg-border/50" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1 bg-border/50" />
      </div>

      {/* Desktop & Tablet Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="hidden sm:block"
      >
        <Button
          type="button"
          onClick={handleGoogleAuth}
          variant="outline"
          className="w-full relative h-9 border-border bg-card hover:bg-card/80 hover:border-muted-foreground/50 transition-all"
        >
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <GoogleIcon className="w-4 h-4" />
          </div>
          <span className="text-xs text-foreground">
            {isLogin ? "Login with Google" : "Sign up with Google"}
          </span>
          <ExternalLink className="w-3 h-3 ml-2 text-muted-foreground" />
        </Button>
      </motion.div>

      {/* Mobile Button (Circle) */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-row justify-center items-center gap-4 sm:hidden"
      >
        <Button
          type="button"
          onClick={handleGoogleAuth}
          variant="outline"
          size="icon"
          className="w-9 h-9 rounded-full border-border bg-card hover:bg-card/80 hover:border-muted-foreground/50 transition-all relative"
          aria-label={isLogin ? "Login with Google" : "Sign up with Google"}
        >
          <GoogleIcon className="w-4 h-4" />
          <span className="sr-only">
            {isLogin ? "Login with Google" : "Sign up with Google"}
          </span>
        </Button>
        <span className="text-xs text-muted-foreground">
          {isLogin ? "Login with Google" : "Sign up with Google"}
        </span>
      </motion.div>
    </div>
  );
}

// Google Icon component
function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
