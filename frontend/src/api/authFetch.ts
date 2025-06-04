// src/api/authFetch.ts
import { BACKEND_URL } from "../data/constants";
import { callLogout } from "./logoutRegistry";

export async function authFetch(
  path: string,
  opts: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    callLogout();

    window.location.replace(
      "/auth?mode=login&msg=Please%20login%20to%20continue"
    );

    return new Promise(() => {});
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...opts,
    headers: { ...opts.headers, Authorization: `Bearer ${token}` },
  });

  if (res.ok) return res;

  if (res.status === 401 || res.status === 403 || (await isTokenError(res))) {
    callLogout();

    window.location.replace("/auth?mode=login&msg=Session%20expired");

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
