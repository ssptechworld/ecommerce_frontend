const translations: Record<string, string> = {
  "auth.connecting": "Connecting...",
  "auth.continueWithGoogle": "Continue with Google",
  "auth.googleLoginFailed": "Google login failed. Please try again.",
};

export const t = (key: string): string => {
  return translations[key] || key;
};
