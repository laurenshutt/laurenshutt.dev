import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        colophon: resolve(__dirname, "colophon/index.html"),
        now: resolve(__dirname, "now/index.html")
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});