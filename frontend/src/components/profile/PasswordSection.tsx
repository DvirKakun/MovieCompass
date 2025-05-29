import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import type { UserProfile } from "../../types/user";

interface PasswordSectionProps {
  user: UserProfile | null;
  getFieldError: (field: string) => string | undefined;
}

export function PasswordSection({ user, getFieldError }: PasswordSectionProps) {
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Check if user likely signed up with Google (basic detection)
  const isGoogleUser = user?.authProvider === "google";

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google User Notice */}
        {isGoogleUser && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-start">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Google Account User</p>
                <p>
                  If you signed up with Google, you can leave the "Current
                  Password" field empty when setting a new password.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="old_password">Current Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="old_password"
              name="old_password"
              type={showPasswords.old ? "text" : "password"}
              placeholder={
                isGoogleUser
                  ? "Leave empty if you signed up with Google"
                  : "Enter current password"
              }
              defaultValue=""
              className={`pl-10 pr-10 ${
                getFieldError("old_password") || getFieldError("password")
                  ? "border-destructive"
                  : ""
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => togglePasswordVisibility("old")}
            >
              {showPasswords.old ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {(getFieldError("old_password") || getFieldError("password")) && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs text-destructive flex items-center mt-1"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              {getFieldError("old_password") || getFieldError("password")}
            </motion.p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="new_password"
                name="new_password"
                type={showPasswords.new ? "text" : "password"}
                placeholder="Enter new password"
                defaultValue=""
                className={`pl-10 pr-10 ${
                  getFieldError("new_password") ? "border-destructive" : ""
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {getFieldError("new_password") && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-destructive flex items-center mt-1"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                {getFieldError("new_password")}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password_confirm">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="new_password_confirm"
                name="new_password_confirm"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirm new password"
                defaultValue=""
                className={`pl-10 pr-10 ${
                  getFieldError("new_password_confirm")
                    ? "border-destructive"
                    : ""
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {getFieldError("new_password_confirm") && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-destructive flex items-center mt-1"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                {getFieldError("new_password_confirm")}
              </motion.p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
