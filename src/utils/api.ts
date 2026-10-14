import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
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
  }
);

export default api;
