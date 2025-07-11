import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { AuthFormData, FormErrors } from "../types/auth";
import { useAuthMode } from "./useAuthMode";
import { BACKEND_URL } from "../data/constants";
import { useUserActions } from "../contexts/UserContext";
import { useMessages } from "../contexts/MessageContext";

function transformBackendErrors(
  backendErrors: Array<{ field: string; message: string }>
): FormErrors {
  const fieldMapping: { [key: string]: string } = {
    first_name: "firstName",
    last_name: "lastName",
    confirm_password: "confirmPassword",
    phone_number: "phoneNumber",
    email: "email",
    password: "password",
    username: "username",
  };

  const transformedErrors: FormErrors = {};

  backendErrors.forEach((error) => {
    const frontendField = fieldMapping[error.field] || error.field;
    transformedErrors[frontendField] = error.message;
  });

  return transformedErrors;
}

export function useAuthSubmit() {
  const navigate = useNavigate();
  const { state, dispatch } = useAuth();
  const { handleModeChange } = useAuthMode();
  const { fetchUserProfile } = useUserActions();
  const { showError, showSuccess } = useMessages();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_MESSAGES" });

    const isLogin = state.isLogin;
    const formData = new FormData(e.currentTarget);
    const data: AuthFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    if (!isLogin) {
      data.first_name = formData.get("firstName") as string;
      data.last_name = formData.get("lastName") as string;
      data.confirm_password = formData.get("confirmPassword") as string;
      data.username = formData.get("username") as string;
      data.phone_number = formData.get("phoneNumber") as string;
    } else {
      data.username = formData.get("email") as string;
    }

    const url = `${BACKEND_URL}/auth/${isLogin ? "token" : "signup"}`;
    const headers = {
      "Content-Type": isLogin
        ? "application/x-www-form-urlencoded"
        : "application/json",
    };
    const body = isLogin
      ? new URLSearchParams({
          grant_type: "password",
          username: data.username,
          password: data.password,
          scope: "",
          client_id: "",
          client_secret: "",
        })
      : JSON.stringify(data);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.errors) {
          const transformedErrors = transformBackendErrors(result.errors);

          dispatch({ type: "SET_ERRORS", payload: transformedErrors });
        } else {
          showError(result.message || "Something went wrong");
        }

        return;
      }

      // ---------- SUCCESS ----------
      if (state.isLogin) {
        showSuccess("Login successful! Redirceting...", 2000);

        const { access_token, user } = result;

        localStorage.setItem("access_token", access_token);

        if (user) fetchUserProfile();

        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        showSuccess(
          "Account created! Check your email to verify your account.",
          4000
        );

        setTimeout(() => handleModeChange("login"), 2500);
      }
    } catch (error) {
      showError("Network error. Please try again.");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return {
    handleSubmit,
    isLoading: state.isLoading,
  };
}
