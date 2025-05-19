import { User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuth } from "../../contexts/AuthContext";

export function AuthFormFields() {
  const { state, dispatch } = useAuth();

  return (
    <>
      {!state.isLogin && (
        <>
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="space-y-0.5">
              <Label htmlFor="firstName" className="text-foreground text-xs">
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
                    state.errors.firstName ? "border-destructive" : ""
                  }`}
                />
              </div>
              {state.errors.firstName && (
                <p className="text-xs text-destructive">
                  {state.errors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="lastName" className="text-foreground text-xs">
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
                    state.errors.lastName ? "border-destructive" : ""
                  }`}
                />
              </div>
              {state.errors.lastName && (
                <p className="text-xs text-destructive">
                  {state.errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="space-y-0.5">
            <Label htmlFor="username" className="text-foreground text-xs">
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
                  state.errors.username ? "border-destructive" : ""
                }`}
              />
            </div>
            {state.errors.username && (
              <p className="text-xs text-destructive">
                {state.errors.username}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-0.5">
            <Label htmlFor="phoneNumber" className="text-foreground text-xs">
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
                  state.errors.phoneNumber ? "border-destructive" : ""
                }`}
              />
            </div>
            {state.errors.phoneNumber && (
              <p className="text-xs text-destructive">
                {state.errors.phoneNumber}
              </p>
            )}
          </div>
        </>
      )}

      {/* Email */}
      <div className="space-y-0.5">
        <Label htmlFor="email" className="text-foreground text-xs">
          {state.isLogin ? "Email or Username" : "Email"}
        </Label>
        <div className="relative">
          <Mail className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type={state.isLogin ? "text" : "email"}
            required
            placeholder="john@example.com"
            className={`pl-7 h-7 text-xs ${
              state.errors.email ? "border-destructive" : ""
            }`}
          />
        </div>
        {state.errors.email && (
          <p className="text-xs text-destructive">{state.errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-0.5">
        <Label htmlFor="password" className="text-foreground text-xs">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={state.showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className={`pl-7 pr-7 h-7 text-xs ${
              state.errors.password ? "border-destructive" : ""
            }`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-1.5 hover:bg-transparent"
            onClick={() => dispatch({ type: "TOGGLE_PASSWORD_VISIBILITY" })}
          >
            {state.showPassword ? (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Eye className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        </div>
        {state.errors.password && (
          <p className="text-xs text-destructive">{state.errors.password}</p>
        )}
      </div>

      {/* Confirm Password (Signup only) */}
      {!state.isLogin && (
        <div className="space-y-0.5">
          <Label htmlFor="confirmPassword" className="text-foreground text-xs">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={state.showConfirmPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className={`pl-7 pr-7 h-7 text-xs ${
                state.errors.confirmPassword ? "border-destructive" : ""
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-1.5 hover:bg-transparent"
              onClick={() =>
                dispatch({ type: "TOGGLE_CONFIRM_PASSWORD_VISIBILITY" })
              }
            >
              {state.showConfirmPassword ? (
                <EyeOff className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Eye className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          </div>
          {state.errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {state.errors.confirmPassword}
            </p>
          )}
        </div>
      )}
    </>
  );
}
