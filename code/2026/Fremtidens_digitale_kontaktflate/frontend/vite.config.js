import fs from "fs";
import { defineConfig } from "vite";

// Inside a Docker container /.dockerenv always exists — use the service name.
// When running locally (npm run dev), fall back to the exposed host port.
const backendTarget = fs.existsSync("/.dockerenv")
  ? "http://backend:8000"
  : "http://localhost:8000";

export default defineConfig({
  server: {
    host: true,
    port: 5001,
    strictPort: true,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
