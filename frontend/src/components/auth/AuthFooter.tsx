import { motion } from "framer-motion";
import { Button } from "../ui/button";

export function AuthFooter() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="text-center mt-4"
    >
      <p className="text-xs text-muted-foreground leading-tight">
        By continuing, you agree to our{" "}
        <Button
          variant="link"
          className="p-0 h-auto text-primary hover:text-primary/80 text-xs"
        >
          Terms
        </Button>{" "}
        and{" "}
        <Button
          variant="link"
          className="p-0 h-auto text-primary hover:text-primary/80 text-xs"
        >
          Privacy Policy
        </Button>
      </p>
    </motion.div>
  );
}
