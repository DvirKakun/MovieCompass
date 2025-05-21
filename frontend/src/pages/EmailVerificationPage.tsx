import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { AuthVerificationAlert } from "../components/auth/AuthVerificationAlert";
import { BACKEND_URL } from "../data/constants";

type VerificationStatus = "loading" | "success" | "error";

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setErrorMessage("Verification token is missing");
        return;
      }

      try {
        const response = await fetch(
          `${BACKEND_URL}/auth/verify-email?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setStatus("error");

          if (result.detail && typeof result.detail === "object") {
            setErrorMessage(
              result.detail.message || "Email verification failed"
            );
          } else {
            setErrorMessage(result.message || "Email verification failed");
          }
        } else {
          setStatus("success");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("Network error. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-primary hover:text-primary/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-4"
                >
                  <RefreshCw className="h-12 w-12 text-primary" />
                </motion.div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                  Verifying Your Email
                </h2>
                <p className="text-secondary text-center">
                  Please wait while we verify your email address...
                </p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                  Email Verified Successfully!
                </h2>
                <p className="text-secondary text-center mb-6">
                  Your email has been verified. You can now sign in to your
                  MovieCompass account.
                </p>
                <Button
                  onClick={() => navigate("/auth?mode=login")}
                  className="bg-primary text-background hover:bg-cta_hover transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Go to Login
                </Button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                  Verification Failed
                </h2>
                <p className="text-secondary text-center mb-2">
                  {errorMessage || "There was a problem verifying your email."}
                </p>
                <p className="text-secondary text-center mb-6">
                  This may be because the link has expired or is invalid.
                </p>

                {/* Use the AuthVerificationAlert component for resending verification */}
                <div className="w-full">
                  <AuthVerificationAlert show={true} />
                </div>

                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/auth?mode=login")}
                    className="border-primary text-primary hover:bg-primary hover:text-background transition-colors"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Go to Login
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
