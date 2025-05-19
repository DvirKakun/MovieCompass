import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { AuthFormData } from "../types/auth";

export function useAuthSubmit() {
  const navigate = useNavigate();
  const { state, dispatch } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_MESSAGES" });

    const formData = new FormData(e.currentTarget);
    const data: AuthFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    if (!state.isLogin) {
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
        `/api/auth/${state.isLogin ? "login" : "signup"}`,
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
          dispatch({ type: "SET_ERRORS", payload: result.errors });
        } else {
          dispatch({
            type: "SET_ERRORS",
            payload: { general: result.message || "Something went wrong" },
          });
        }
      } else {
        const message = state.isLogin
          ? "Login successful!"
          : "Account created successfully!";
        dispatch({ type: "SET_SUCCESS_MESSAGE", payload: message });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error) {
      dispatch({
        type: "SET_ERRORS",
        payload: { general: "Network error. Please try again." },
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return {
    handleSubmit,
    isLoading: state.isLoading,
  };
}
