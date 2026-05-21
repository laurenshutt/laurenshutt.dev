import { defineConfig } from "vite";

export default defineConfig({
  build: {
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keeps chunk filenames stable and cache-friendly
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});