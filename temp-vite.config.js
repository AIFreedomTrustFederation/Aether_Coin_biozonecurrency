
  import { defineConfig } from "vite";
  import { fileURLToPath } from "url";
  import path from "path";
  import react from "@vitejs/plugin-react";
  import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
  import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  export default defineConfig({
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    server: {
      port: 5173,
      host: '0.0.0.0',
      strictPort: true,
      hmr: {
        // Enable HMR with Replit compatibility
        clientPort: 5000,
        host: 'localhost',
        protocol: 'ws',
        timeout: 120000,
        overlay: true,
      },
      watch: {
        usePolling: true,
        interval: 1000,
      }
    },
    optimizeDeps: {
      force: true
    }
  });
  