import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { useAuthMode } from "../../hooks/useAuthMode";
import { AuthFormTitle } from "./AuthFormTitle";
import { AuthForm } from "./AuthForm";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export function AuthFormCard() {
  const { isLogin, direction } = useAuthMode();

  return (
    <Card className="bg-card border-border shadow-2xl">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={isLogin ? "login-form" : "signup-form"}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <CardContent className="p-3">
              <AuthFormTitle />
              <AuthForm />
            </CardContent>
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}
