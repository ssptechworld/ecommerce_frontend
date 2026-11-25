import type { AuthResponseType } from "@/types/types";

const USER_STORAGE_KEY = "user";

type JwtPayload = {
  exp?: number;
  id?: string;
  role?: string;
};

const parseJwtPayload = (token: string): JwtPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

export const isTokenValid = (token?: string | null): boolean => {
  if (!token || typeof token !== "string") return false;
  const payload = parseJwtPayload(token);
  if (!payload) return false;
  if (typeof payload.exp === "number") {
    return payload.exp * 1000 > Date.now();
  }
  return true;
};

export const getStoredAuthUser = (): AuthResponseType | null => {
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw || raw === "null") return null;
    const parsed = JSON.parse(raw) as AuthResponseType;
    if (!parsed || !parsed.token || !isTokenValid(parsed.token)) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const saveStoredAuthUser = (user: AuthResponseType): void => {
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredAuthUser = (): void => {
  window.localStorage.removeItem(USER_STORAGE_KEY);
};
