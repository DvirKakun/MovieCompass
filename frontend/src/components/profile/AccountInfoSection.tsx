import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import type { UserProfile } from "../../types/user";

interface AccountInfoSectionProps {
  user: UserProfile | null;
  getFieldError: (field: string) => string | undefined;
}

export function AccountInfoSection({
  user,
  getFieldError,
}: AccountInfoSectionProps) {
  const [isEmailChangeMode, setIsEmailChangeMode] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            placeholder={user?.username || "Enter username"}
            defaultValue=""
            className={getFieldError("username") ? "border-destructive" : ""}
          />
          {getFieldError("username") && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs text-destructive flex items-center mt-1"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              {getFieldError("username")}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="new_email">Email Address</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEmailChangeMode(!isEmailChangeMode)}
              className="text-primary hover:text-primary/80"
            >
              {isEmailChangeMode ? "Cancel" : "Change Email"}
            </Button>
          </div>

          {!isEmailChangeMode ? (
            <div className="p-3 bg-muted rounded-md text-secondary">
              {user?.email}
            </div>
          ) : (
            <>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new_email"
                  name="new_email"
                  type="email"
                  placeholder="Enter new email address"
                  defaultValue=""
                  className={`pl-10 ${
                    getFieldError("new_email") || getFieldError("email")
                      ? "border-destructive"
                      : ""
                  }`}
                />
              </div>
              {(getFieldError("new_email") || getFieldError("email")) && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-destructive flex items-center mt-1"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {getFieldError("new_email") || getFieldError("email")}
                </motion.p>
              )}
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                <div className="flex items-start">
                  <Info className="w-4 h-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-primary">
                    <p className="font-medium">Email Change Process</p>
                    <p>
                      A verification email will be sent to your new address.
                      Your email will only be updated after verification.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
