import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("@tensorflow") ||
            id.includes("face-api") ||
            id.includes("coco-ssd") ||
            id.includes("@vladmandic")
          ) {
            return "ai-vendor";
          }
          if (id.includes("recharts") || id.includes("d3-")) {
            return "charts";
          }
          if (id.includes("jspdf") || id.includes("html2canvas")) {
            return "pdf";
          }
          if (
            id.includes("socket.io-client") ||
            id.includes("/socket.io/")
          ) {
            return "socket";
          }
          if (id.includes("react-dom") || id.includes("react-router")) {
            return "react-vendor";
          }
          if (id.includes("i18next")) {
            return "i18n";
          }
          return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});
