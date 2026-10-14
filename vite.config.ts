import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 3050,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-icons")) {
              return "vendor-icons";
            }
            if (id.includes("@reduxjs/toolkit") || id.includes("react-redux")) {
              return "vendor-redux";
            }
            if (id.includes("axios")) {
              return "vendor-axios";
            }
          }
        },
      },
    },
  },
});
