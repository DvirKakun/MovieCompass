import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function AuthMessages() {
  const { state } = useAuth();

  return (
    <>
      <AnimatePresence>
        {state.successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center text-primary shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {state.successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center text-destructive shadow-lg"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {state.errors.general}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
