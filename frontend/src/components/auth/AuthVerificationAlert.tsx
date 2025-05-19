import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Mail } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";

export function AuthVerificationAlert() {
  const { state } = useAuth();

  const verificationError = state.errors.verification;

  if (!verificationError) return null;

  const handleResendVerification = async () => {
    // Add logic to resend verification email
    console.log("Resending verification email...");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-4 p-3 bg-blue-50 border-blue-200 border rounded-lg"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5  text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Email Verification Required
            </h4>
            <p className="text-xs text-blue-800 mb-3" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                className="text-blue-700 border-blue-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-xs h-7 transition-colors"
              >
                <Mail className="w-3 h-3 mr-1" />
                Resend Email
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
