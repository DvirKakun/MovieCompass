import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface ProfileSuccessMessageProps {
  message: string | null;
}

export function ProfileSuccessMessage({ message }: ProfileSuccessMessageProps) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center text-primary"
      >
        <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {message.includes("Verification") && (
            <p className="text-sm mt-1 text-primary/80">
              Please check your email and verify your new address.
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
