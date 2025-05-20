// src/utils/authFetch.ts
import { BACKEND_URL } from "../data/constants";

// Global variable to store the logout function
let logoutHandler: ((error: string | null) => void) | null = null;

/**
 * Register the logout function from UserContext
 * Call this in your UserProvider component
 */
export function registerLogoutHandler(handler: (error: string | null) => void) {
  logoutHandler = handler;
}

/**
 * Fetch wrapper that uses the registered logout handler for token expiration
 */
export async function authFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Add token to headers if available
  const token = localStorage.getItem("access_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Make the request
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Parse the response
  const data = await response.json();

  // Check if response is not ok
  if (!response.ok) {
    // Check specifically for token expiration
    if (
      response.status === 400 &&
      data.errors?.some((err: any) => err.field === "token")
    ) {
      // Use the registered logout handler if available
      if (logoutHandler) {
        logoutHandler("token_expired");
      } else {
        // Fallback if logout handler is not registered
        localStorage.removeItem("access_token");
        window.location.href = "/auth?mode=login&error=token_expired";
      }

      // Throw error to stop further execution
      throw new Error("Token expired");
    }

    // For other errors, just throw the response
    throw data.errors;
  }

  // Return the data
  return data;
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string) => authFetch<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body: any) =>
    authFetch<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: any) =>
    authFetch<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: any) =>
    authFetch<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) => authFetch<T>(endpoint, { method: "DELETE" }),
};
