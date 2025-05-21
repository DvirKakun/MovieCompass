import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  TimerReset,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { BACKEND_URL } from "../data/constants";

// Token states
type TokenStatus = "verifying" | "valid" | "invalid";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  // Token verification state
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("verifying");
  const [tokenError, setTokenError] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Error states
  const [errors, setErrors] = useState({
    general: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Verify token when component mounts
  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      setTokenError("No reset token provided");

      return;
    }

    async function verifyToken() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/auth/verify-reset-token?token=${token}`
        );

        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenStatus("valid");
        } else {
          setTokenStatus("invalid");
          setTokenError(data.message || "Invalid or expired reset token");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setTokenStatus("invalid");
        setTokenError("Your reset session has expired");
      }
    }

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({
      general: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Get form data
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: newPassword,
          new_password_confirm: confirmPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } else {
        // Handle API errors
        if (result.errors && result.errors.length > 0) {
          const newErrors = { ...errors };

          for (const error of result.errors) {
            // Handle username field errors as general errors
            if (error.field === "username") {
              newErrors.general = error.message;
            }
            // Handle token errors as general errors
            else if (error.field === "token") {
              setTokenStatus("invalid");
              setTokenError(error.message || "Invalid or expired token");

              return;
            }
            // Handle specific password field errors
            else if (
              error.field === "new_password" ||
              error.field === "password"
            ) {
              newErrors.newPassword = error.message;
            } else if (error.field === "new_password_confirm") {
              newErrors.confirmPassword = error.message;
            } else {
              newErrors.general = error.message;
            }
          }

          setErrors(newErrors);
        } else {
          setErrors((prev) => ({
            ...prev,
            general: result.message || "Failed to reset password",
          }));
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Network error. Please check your connection and try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Render content based on token status
  const renderContent = () => {
    if (tokenStatus === "verifying") {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary">Verifying your reset link...</p>
        </div>
      );
    }

    if (tokenStatus === "invalid") {
      return (
        <div className="text-center py-8 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-medium text-foreground">
            Reset Link Invalid
          </h3>
          <p className="text-secondary max-w-md mx-auto">
            {tokenError ||
              "This password reset link is invalid or has expired."}
          </p>
          <Button
            onClick={() => navigate("/auth/forgot-password")}
            className="mt-2"
          >
            <TimerReset className="w-4 h-4 mr-2" />
            Request New Reset Link
          </Button>
        </div>
      );
    }

    if (success) {
      return (
        <div className="text-center py-8 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-foreground">
            Password Reset Successful
          </h3>
          <p className="text-secondary">
            Your password has been reset successfully. You will be redirected to
            login...
          </p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-foreground text-sm">
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              className={`pl-10 pr-10 ${
                errors.newPassword
                  ? "border-destructive focus:border-destructive"
                  : ""
              }`}
              placeholder="Enter new password"
              disabled={isLoading}
              onChange={() => {
                if (errors.newPassword) {
                  setErrors((prev) => ({ ...prev, newPassword: "" }));
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>

          <AnimatePresence>
            {errors.newPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-2 mt-1 bg-destructive/10 border border-destructive/20 rounded-md"
              >
                <div className="flex items-start">
                  <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-xs text-destructive">
                    {errors.newPassword}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-foreground text-sm">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              className={`pl-10 ${
                errors.confirmPassword
                  ? "border-destructive focus:border-destructive"
                  : ""
              }`}
              placeholder="Confirm your password"
              disabled={isLoading}
              onChange={() => {
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }
              }}
            />
          </div>

          <AnimatePresence>
            {errors.confirmPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-2 mt-1 bg-destructive/10 border border-destructive/20 rounded-md"
              >
                <div className="flex items-start">
                  <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-xs text-destructive">
                    {errors.confirmPassword}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-background hover:bg-cta_hover transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
              Resetting Password...
            </div>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    );
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
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center shadow-lg max-w-md"
          >
            <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
            <span className="text-destructive text-sm">{errors.general}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Reset Password
              </h2>
              <p className="text-secondary text-sm mt-2">
                Create a new password for your account
              </p>
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
