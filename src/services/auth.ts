import { BACKEND_ORIGIN } from "@utils/api";

export const authService = {
  async signInWithGoogle(): Promise<void> {
    window.location.href = `${BACKEND_ORIGIN}/oauth2/authorization/google`;
  },
};
