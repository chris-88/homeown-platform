import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGhPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: isGhPages ? "/homeown-platform/" : "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

