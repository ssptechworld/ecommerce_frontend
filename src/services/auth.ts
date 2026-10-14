export const authService = {
  async signInWithGoogle(): Promise<void> {
    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:5001";
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  },
};
