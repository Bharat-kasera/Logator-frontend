import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:4001",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "flag-icon-css/css/flag-icon.min.css";`,
      },
    },
  },
});
