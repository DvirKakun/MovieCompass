import { useCallback } from "react";
import { useUserActions, useUserState } from "../contexts/UserContext";
import type { UpdateUserProfile } from "../types/user";

export function useProfileForm() {
  const { profileUpdateLoading, profileFieldErrors, profileUpdateSuccess } =
    useUserState();
  const { updateUserProfile, clearProfileMessages, getFieldError } =
    useUserActions();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const profileData: UpdateUserProfile = {};

      // Extract and clean form data
      const fields: (keyof UpdateUserProfile)[] = [
        "first_name",
        "last_name",
        "phone_number",
        "username",
        "new_email",
        "old_password",
        "new_password",
        "new_password_confirm",
      ];

      fields.forEach((field) => {
        const value = formData.get(field as string) as string;
        if (value && value.trim()) {
          profileData[field] = value.trim();
        }
      });

      // Only submit if there are changes
      if (Object.keys(profileData).length === 0) {
        return;
      }

      await updateUserProfile(profileData);
    },
    [updateUserProfile]
  );

  const resetForm = useCallback(
    (formRef: React.RefObject<HTMLFormElement | null>) => {
      if (formRef.current) {
        formRef.current.reset();
      }
    },
    []
  );

  return {
    handleSubmit,
    resetForm,
    isLoading: profileUpdateLoading,
    errors: profileFieldErrors,
    successMessage: profileUpdateSuccess,
    getFieldError,
    clearMessages: clearProfileMessages,
  };
}
