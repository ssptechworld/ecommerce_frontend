import axios from "axios";

const DEFAULT_DEV_API_URL = "http://localhost:5001/api";
const DEFAULT_PROD_API_URL = "https://ecommerce-backend-y2b5.onrender.com/api";

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const trimmedApiUrl = rawApiUrl ? rawApiUrl.replace(/\/+$/, "") : "";

export const API_BASE_URL = trimmedApiUrl
  ? trimmedApiUrl.endsWith("/api")
    ? trimmedApiUrl
    : `${trimmedApiUrl}/api`
  : import.meta.env.PROD
    ? DEFAULT_PROD_API_URL
    : DEFAULT_DEV_API_URL;

export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const userData = window.localStorage.getItem("user");
  if (userData && userData !== "null") {
    try {
      const user = JSON.parse(userData);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (error) {
      console.error("Error parsing user data", error);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.localStorage.removeItem("user");
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
