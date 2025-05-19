import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Mail, Speaker } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuth } from "../../contexts/AuthContext";

export function AuthVerificationAlert() {
  const { state } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const verificationError = state.errors.verification;

  if (!verificationError) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResendVerification = async (
    e?: React.FormEvent | React.MouseEvent
  ) => {
    if (e) e.preventDefault();

    // Clear previous errors
    setEmailError("");

    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch(
        "http://localhost:8000/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setResendSuccess(true);
        setEmail(""); // Clear email after successful send
        // Auto-hide success message after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000);
      } else {
        setEmailError(
          result.errors[0].message || "Failed to send verification email"
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      setEmailError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
        animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          height: { type: "spring", stiffness: 300, damping: 30 },
        }}
      >
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Email Verification Required
              </h4>

              <p className="text-sm text-secondary mb-4 leading-relaxed">
                Please verify your email address to continue. Check your inbox
                for a verification link.
              </p>

              {/* Success Message */}
              <AnimatePresence>
                {resendSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-md"
                  >
                    <div className="flex items-center text-primary">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        Verification email sent successfully! Check your inbox
                        and spam folder.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Resend Form */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="resend-email"
                    className="text-xs font-medium text-foreground"
                  >
                    Enter your email to resend verification
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resend-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Clear error when user starts typing
                        if (emailError) setEmailError("");
                      }}
                      placeholder="your.email@example.com"
                      className={`pl-9 h-9 bg-background/50 border-border focus:border-primary transition-colors ${
                        emailError
                          ? "border-destructive focus:border-destructive"
                          : ""
                      }`}
                      disabled={isResending}
                      autoComplete="email"
                    />
                  </div>
                  {emailError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-destructive mt-1"
                    >
                      {emailError}
                    </motion.p>
                  )}
                </div>

                <Button
                  type="button"
                  disabled={isResending || !email.trim()}
                  className="w-full bg-primary text-background hover:bg-cta_hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  size="sm"
                  onClick={handleResendVerification}
                >
                  {isResending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-b-transparent mr-2" />
                      Sending verification email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>

              {/* Helper Text */}
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try a
                  different email address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
