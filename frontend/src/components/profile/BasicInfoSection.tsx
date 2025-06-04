import { motion } from "framer-motion";
import { User, Phone, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { UserProfile } from "../../types/user";

interface BasicInfoSectionProps {
  user: UserProfile | null;
  getFieldError: (field: string) => string | undefined;
}

export function BasicInfoSection({
  user,
  getFieldError,
}: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              placeholder={user?.firstName || "Enter first name"}
              defaultValue=""
              className={
                getFieldError("first_name") ? "border-destructive" : ""
              }
            />
            {getFieldError("first_name") && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-destructive flex items-center mt-1"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                {getFieldError("first_name")}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              placeholder={user?.lastName || "Enter last name"}
              defaultValue=""
              className={getFieldError("last_name") ? "border-destructive" : ""}
            />
            {getFieldError("last_name") && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-destructive flex items-center mt-1"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                {getFieldError("last_name")}
              </motion.p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone_number"
              name="phone_number"
              placeholder={
                user?.phoneNumber || "Enter phone number (e.g., +1234567890)"
              }
              defaultValue=""
              className={`pl-10 ${
                getFieldError("phone_number") ? "border-destructive" : ""
              }`}
            />
          </div>
          {getFieldError("phone_number") && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs text-destructive flex items-center mt-1"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              {getFieldError("phone_number")}
            </motion.p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
