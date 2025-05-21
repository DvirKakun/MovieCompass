import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { BACKEND_URL } from "../data/constants";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setEmailError("");
    setGeneralError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        // Handle API errors
        if (result.errors && result.errors.length > 0) {
          const errorObj = result.errors[0];
          if (errorObj.field === "email") {
            setEmailError(errorObj.message);
          } else {
            setGeneralError(errorObj.message || "Failed to send reset email");
          }
        } else {
          setGeneralError(
            result.message || "Something went wrong. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      setGeneralError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/auth")}
          className="text-primary hover:text-primary/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>
      </div>

      {/* General Error Message */}
      <AnimatePresence>
        {generalError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center shadow-lg max-w-md"
          >
            <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
            <span className="text-destructive text-sm">{generalError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Forgot Password
              </h2>
              <p className="text-secondary text-sm mt-2">
                {!success
                  ? "Enter your email address and we'll send you a link to reset your password."
                  : "Check your email for a password reset link."}
              </p>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Reset Link Sent!
                    </h4>
                    <p className="text-sm text-secondary mt-1">
                      We've sent a password reset link to{" "}
                      <strong>{email}</strong>. Please check your inbox and spam
                      folders.
                    </p>
                  </div>
                </div>

                <Button className="w-full" onClick={() => navigate("/auth")}>
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-sm">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Clear error when user starts typing
                        if (emailError) setEmailError("");
                      }}
                      placeholder="your.email@example.com"
                      className={`pl-10 ${
                        emailError
                          ? "border-destructive focus:border-destructive"
                          : ""
                      }`}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>

                  {/* Email error message beneath the field */}
                  <AnimatePresence>
                    {emailError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-2 mt-1 bg-destructive/10 border border-destructive/20 rounded-md"
                      >
                        <div className="flex items-start">
                          <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-xs text-destructive">
                            {emailError}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-background hover:bg-cta_hover transition-colors"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
