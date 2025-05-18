import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Star,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface FormErrors {
  [key: string]: string;
}

interface AuthFormData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  username?: string;
  phoneNumber?: string;
}

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize form mode based on URL params
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  const toggleMode = (mode: "login" | "signup") => {
    setIsLogin(mode === "login");
    setSearchParams({ mode });
    setErrors({});
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const data: AuthFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    if (!isLogin) {
      data.firstName = formData.get("firstName") as string;
      data.lastName = formData.get("lastName") as string;
      data.confirmPassword = formData.get("confirmPassword") as string;
      data.username = formData.get("username") as string;
      data.phoneNumber = formData.get("phoneNumber") as string;
    } else {
      data.username = formData.get("email") as string;
    }

    try {
      const response = await fetch(
        `/api/auth/${isLogin ? "login" : "signup"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.message || "Something went wrong" });
        }
      } else {
        setSuccessMessage(
          isLogin ? "Login successful!" : "Account created successfully!"
        );
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

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

  const [direction, setDirection] = useState(0);

  const handleModeChange = (newMode: "login" | "signup") => {
    setDirection(newMode === "signup" ? 1 : -1);
    toggleMode(newMode);
  };

  // Text content for each mode
  const textContent = {
    login: {
      title: "Welcome Back!",
      subtitle: "Sign in to your account",
      description:
        "Access your personalized movie recommendations, saved favorites, and continue your cinematic journey.",
      features: [
        { icon: Star, text: "Personalized recommendations" },
        { icon: Shield, text: "Secure account protection" },
        { icon: Zap, text: "Instant access to content" },
      ],
      cta: "New to MovieCompass?",
      ctaButton: "Create Account",
    },
    signup: {
      title: "Join MovieCompass",
      subtitle: "Create your account",
      description:
        "Discover amazing movies, get AI-powered recommendations, and join our community of film enthusiasts.",
      features: [
        { icon: Star, text: "AI-powered recommendations" },
        { icon: Shield, text: "Safe & secure platform" },
        { icon: Zap, text: "Instant movie discovery" },
      ],
      cta: "Already have an account?",
      ctaButton: "Sign In",
    },
  };

  const currentText = isLogin ? textContent.login : textContent.signup;

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-primary hover:text-primary/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Global Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center text-primary shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center text-destructive shadow-lg"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {errors.general}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="h-full flex">
        {/* Left Column - Text Content */}
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
                  <p className="text-xl text-secondary">
                    {currentText.subtitle}
                  </p>
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
                    onClick={() =>
                      handleModeChange(isLogin ? "signup" : "login")
                    }
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

        {/* Right Column - Form */}
        <div className="w-full lg:w-1/2 h-full flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden p-2 text-center">
            <h1 className="text-lg font-heading font-bold text-foreground">
              MovieCompass
            </h1>
            <p className="text-xs text-secondary">
              {isLogin ? "Welcome back!" : "Join our community"}
            </p>
          </div>

          {/* Mode Toggle - Mobile Only */}
          <div className="lg:hidden px-2 pb-1">
            <div className="bg-muted rounded-lg p-0.5">
              <div className="grid w-full grid-cols-2">
                <Button
                  variant={isLogin ? "default" : "ghost"}
                  onClick={() => handleModeChange("login")}
                  size="sm"
                  className={`h-7 text-xs ${
                    isLogin
                      ? "bg-primary text-background"
                      : "text-secondary hover:text-foreground"
                  } transition-all duration-300`}
                >
                  <LogIn className="w-3 h-3 mr-1" />
                  Login
                </Button>
                <Button
                  variant={!isLogin ? "default" : "ghost"}
                  onClick={() => handleModeChange("signup")}
                  size="sm"
                  className={`h-7 text-xs ${
                    !isLogin
                      ? "bg-primary text-background"
                      : "text-secondary hover:text-foreground"
                  } transition-all duration-300`}
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Sign Up
                </Button>
              </div>
            </div>
          </div>

          {/* Form Container - Scrollable */}
          <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-2 lg:p-4 overflow-y-auto">
            <div className="w-full max-w-md">
              {/* Form Title - Mobile */}
              <div className="lg:hidden text-center mb-2">
                <h2 className="text-lg font-heading font-bold text-foreground">
                  {isLogin ? "Sign In" : "Create Account"}
                </h2>
              </div>

              {/* Form Card */}
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
                        <div className="hidden lg:block text-center mb-4">
                          <h2 className="text-xl font-heading font-bold text-foreground">
                            {isLogin ? "Sign In" : "Create Account"}
                          </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-2">
                          {!isLogin && (
                            <>
                              {/* Name Fields */}
                              <div className="grid grid-cols-2 gap-1.5">
                                <div className="space-y-0.5">
                                  <Label
                                    htmlFor="firstName"
                                    className="text-foreground text-xs"
                                  >
                                    First Name
                                  </Label>
                                  <div className="relative">
                                    <User className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                    <Input
                                      id="firstName"
                                      name="firstName"
                                      type="text"
                                      required
                                      placeholder="John"
                                      className={`pl-7 h-7 text-xs ${
                                        errors.firstName
                                          ? "border-destructive"
                                          : ""
                                      }`}
                                    />
                                  </div>
                                  {errors.firstName && (
                                    <p className="text-xs text-destructive">
                                      {errors.firstName}
                                    </p>
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  <Label
                                    htmlFor="lastName"
                                    className="text-foreground text-xs"
                                  >
                                    Last Name
                                  </Label>
                                  <div className="relative">
                                    <User className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                    <Input
                                      id="lastName"
                                      name="lastName"
                                      type="text"
                                      required
                                      placeholder="Doe"
                                      className={`pl-7 h-7 text-xs ${
                                        errors.lastName
                                          ? "border-destructive"
                                          : ""
                                      }`}
                                    />
                                  </div>
                                  {errors.lastName && (
                                    <p className="text-xs text-destructive">
                                      {errors.lastName}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Username */}
                              <div className="space-y-0.5">
                                <Label
                                  htmlFor="username"
                                  className="text-foreground text-xs"
                                >
                                  Username
                                </Label>
                                <div className="relative">
                                  <User className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                  <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    placeholder="johndoe"
                                    className={`pl-7 h-7 text-xs ${
                                      errors.username
                                        ? "border-destructive"
                                        : ""
                                    }`}
                                  />
                                </div>
                                {errors.username && (
                                  <p className="text-xs text-destructive">
                                    {errors.username}
                                  </p>
                                )}
                              </div>

                              {/* Phone */}
                              <div className="space-y-0.5">
                                <Label
                                  htmlFor="phoneNumber"
                                  className="text-foreground text-xs"
                                >
                                  Phone Number
                                </Label>
                                <div className="relative">
                                  <Phone className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                  <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    required
                                    placeholder="+1 555-0000"
                                    className={`pl-7 h-7 text-xs ${
                                      errors.phoneNumber
                                        ? "border-destructive"
                                        : ""
                                    }`}
                                  />
                                </div>
                                {errors.phoneNumber && (
                                  <p className="text-xs text-destructive">
                                    {errors.phoneNumber}
                                  </p>
                                )}
                              </div>
                            </>
                          )}

                          {/* Email */}
                          <div className="space-y-0.5">
                            <Label
                              htmlFor="email"
                              className="text-foreground text-xs"
                            >
                              {isLogin ? "Email or Username" : "Email"}
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                              <Input
                                id="email"
                                name="email"
                                type={isLogin ? "text" : "email"}
                                required
                                placeholder={
                                  isLogin
                                    ? "john@example.com"
                                    : "john@example.com"
                                }
                                className={`pl-7 h-7 text-xs ${
                                  errors.email ? "border-destructive" : ""
                                }`}
                              />
                            </div>
                            {errors.email && (
                              <p className="text-xs text-destructive">
                                {errors.email}
                              </p>
                            )}
                          </div>

                          {/* Password */}
                          <div className="space-y-0.5">
                            <Label
                              htmlFor="password"
                              className="text-foreground text-xs"
                            >
                              Password
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                              <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className={`pl-7 pr-7 h-7 text-xs ${
                                  errors.password ? "border-destructive" : ""
                                }`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-1.5 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-3 w-3 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                            {errors.password && (
                              <p className="text-xs text-destructive">
                                {errors.password}
                              </p>
                            )}
                          </div>

                          {/* Confirm Password (Signup only) */}
                          {!isLogin && (
                            <div className="space-y-0.5">
                              <Label
                                htmlFor="confirmPassword"
                                className="text-foreground text-xs"
                              >
                                Confirm Password
                              </Label>
                              <div className="relative">
                                <Lock className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                                <Input
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  required
                                  placeholder="••••••••"
                                  className={`pl-7 pr-7 h-7 text-xs ${
                                    errors.confirmPassword
                                      ? "border-destructive"
                                      : ""
                                  }`}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-1.5 hover:bg-transparent"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                              {errors.confirmPassword && (
                                <p className="text-xs text-destructive">
                                  {errors.confirmPassword}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Submit Button */}
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="pt-2"
                          >
                            <Button
                              type="submit"
                              className="w-full bg-primary text-background hover:bg-cta_hover transition-colors h-8 text-xs"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-background mr-2"></div>
                                  Processing...
                                </div>
                              ) : (
                                <>
                                  {isLogin ? (
                                    <LogIn className="w-3 h-3 mr-2" />
                                  ) : (
                                    <UserPlus className="w-3 h-3 mr-2" />
                                  )}
                                  {isLogin ? "Sign In" : "Create Account"}
                                </>
                              )}
                            </Button>
                          </motion.div>

                          {/* Forgot Password (Login only) */}
                          {isLogin && (
                            <div className="text-center pt-1">
                              <Button
                                variant="link"
                                className="text-primary hover:text-primary/80 text-xs h-auto p-0"
                                onClick={() => navigate("/forgot-password")}
                              >
                                Forgot your password?
                              </Button>
                            </div>
                          )}
                        </form>
                      </CardContent>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Card>

              {/* Footer */}
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

              {/* Mobile Mode Switch */}
              <div className="lg:hidden text-center mt-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {isLogin
                    ? "New to MovieCompass?"
                    : "Already have an account?"}
                </p>
                <Button
                  variant="link"
                  onClick={() => handleModeChange(isLogin ? "signup" : "login")}
                  className="text-primary hover:text-primary/80 text-xs h-auto p-0"
                >
                  {isLogin ? "Create Account" : "Sign In"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
