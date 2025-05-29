import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { useUserState } from "../contexts/UserContext";
import { AuthMessages } from "../components/auth/AuthMessages";
import { useProfileForm } from "../hooks/useProfileForm";
import { BasicInfoSection } from "../components/profile/BasicInfoSection";
import { AccountInfoSection } from "../components/profile/AccountInfoSection";
import { PasswordSection } from "../components/profile/PasswordSection";
import { ProfileSuccessMessage } from "../components/profile/ProfileSuccessMessage";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { user } = useUserState();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    handleSubmit,
    resetForm,
    isLoading,
    successMessage,
    getFieldError,
    clearMessages,
  } = useProfileForm();

  useEffect(() => {
    // Clear messages when component mounts
    clearMessages();
  }, [clearMessages]);

  useEffect(() => {
    // Auto-clear success message and reset form after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        clearMessages();
        resetForm(formRef);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearMessages, resetForm]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    await handleSubmit(e);

    // Reset form after successful submission
    if (successMessage) {
      resetForm(formRef);
    }
  };

  return (
    <>
      <AuthMessages />

      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="p-0 hover:bg-transparent"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Dashboard
                </Button>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      Profile Settings
                    </h1>
                    <p className="text-secondary">
                      Manage your account information
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <ProfileSuccessMessage message={successMessage} />

            {/* Profile Form */}
            <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <BasicInfoSection user={user} getFieldError={getFieldError} />

              {/* Account Information Section */}
              <AccountInfoSection user={user} getFieldError={getFieldError} />

              {/* Password Section */}
              <PasswordSection user={user} getFieldError={getFieldError} />

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-cta_hover text-background px-8"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                      Saving Changes...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </>
  );
}
