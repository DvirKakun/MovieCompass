import { BACKEND_URL } from "../data/constants";
import { callLogout } from "./logoutRegistry";

let globalNavigate:
  | ((path: string, options?: { replace?: boolean }) => void)
  | null = null;

export function setGlobalNavigate(
  navigate: (path: string, options?: { replace?: boolean }) => void
) {
  globalNavigate = navigate;
}

export async function authFetch(
  path: string,
  opts: RequestInit = {},
  showError?: (text: string, duration?: number) => void
): Promise<Response> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    callLogout();

    if (showError) {
      showError("Please login to continue");
    }

    if (globalNavigate) {
      globalNavigate("/auth?mode=login", { replace: true });
    } else {
      window.location.replace("/auth?mode=login");
    }

    return new Promise(() => {});
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...opts,
    headers: { ...opts.headers, Authorization: `Bearer ${token}` },
  });

  if (res.ok) return res;

  if (res.status === 401 || res.status === 403 || (await isTokenError(res))) {
    callLogout();

    if (showError) {
      showError("Session expired. Please login again.");
    }

    if (globalNavigate) {
      globalNavigate("/auth?mode=login", { replace: true });
    } else {
      window.location.replace("/auth?mode=login");
    }

    return new Promise(() => {});
  }

  return res; // other errors: let caller handle
}

async function isTokenError(res: Response) {
  try {
    const data = await res.clone().json();

    return (
      Array.isArray(data?.errors) &&
      data.errors.some((e: any) => e.field === "token")
    );
  } catch {
    return false;
  }
}
