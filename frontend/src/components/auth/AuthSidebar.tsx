import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { useAuthMode } from "../../hooks/useAuthMode";
import { useAuthContent } from "../../hooks/useAuthContent";

const textSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? -300 : 300,
    opacity: 0,
  }),
};

export function AuthSidebar() {
  const { isLogin, direction, handleModeChange } = useAuthMode();
  const currentText = useAuthContent(isLogin);

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-card via-card to-muted relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5" />
      <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={isLogin ? "login-text" : "signup-text"}
            custom={direction}
            variants={textSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="space-y-8"
          >
            {/* Logo */}
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                MovieCompass
              </h1>
              <div className="w-12 h-1 bg-primary rounded-full" />
            </div>

            {/* Main Text */}
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-5xl font-heading font-bold text-foreground">
                {currentText.title}
              </h2>
              <p className="text-xl text-secondary">{currentText.subtitle}</p>
              <p className="text-secondary leading-relaxed">
                {currentText.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {currentText.features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="pt-8">
              <p className="text-secondary mb-4">{currentText.cta}</p>
              <Button
                variant="outline"
                onClick={() => handleModeChange(isLogin ? "signup" : "login")}
                className="border-primary text-primary hover:bg-primary hover:text-background transition-colors"
                size="lg"
              >
                {currentText.ctaButton}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
