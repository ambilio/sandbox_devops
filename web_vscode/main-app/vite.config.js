
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  plugins: [react(),tailwindcss(),],
  base: "/app/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // main-app should run on 5174 so ai-lab can reliably redirect to it
    port: 5174,
    strictPort: true,
    host: true
  }
});
