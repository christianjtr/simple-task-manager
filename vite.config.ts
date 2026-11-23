import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.DEMO_BASE === "true" ? "/simple-task-manager/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@styles": "/src/styles",
      "@components": "/src/components",
      "@src": "/src",
    },
  },
});
