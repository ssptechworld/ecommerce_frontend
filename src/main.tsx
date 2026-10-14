// --- Libraries
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

// --- Components
import AppRouter from "@routes/AppRouter";
import { AuthProvider } from "@/context/useAuth";

// --- Local Files
import store from "@app/store";

// --- Styles
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AuthProvider>
      <StrictMode>
        <AppRouter />
        <Toaster
          toastOptions={{
            style: {
              maxWidth: "90vw",
            },
          }}
        />
      </StrictMode>
    </AuthProvider>
  </Provider>,
);
