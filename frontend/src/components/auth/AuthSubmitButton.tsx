import { motion } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";

export function AuthSubmitButton() {
  const { state } = useAuth();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="pt-2"
    >
      <Button
        type="submit"
        className="w-full bg-primary text-background hover:bg-cta_hover transition-colors h-8 text-xs"
        disabled={state.isLoading}
      >
        {state.isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-background mr-2"></div>
            Processing...
          </div>
        ) : (
          <>
            {state.isLogin ? (
              <LogIn className="w-3 h-3 mr-2" />
            ) : (
              <UserPlus className="w-3 h-3 mr-2" />
            )}
            {state.isLogin ? "Login" : "Create Account"}
          </>
        )}
      </Button>
    </motion.div>
  );
}
