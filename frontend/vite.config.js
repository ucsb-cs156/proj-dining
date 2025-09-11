import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx,js,ts}",
    }),
  ],
  build: {
    outDir: "build", // Changes the output directory from 'dist' to 'build'
    chunkSizeWarningLimit: 512,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  test: {
    globals: true, // makes describe, it, expect available globally
    environment: "jsdom", // makes it possible to use DOM APIs
    setupFiles: "./vitest.setup.js",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/main/**"],
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 80,
        functions: 80,
      },
      reporter: ["html", "text-summary"],
    },
  },
  resolve: {
    alias: {
      main: path.resolve(__dirname, "./src/main"),
      fixtures: path.resolve(__dirname, "./src/fixtures"),
      tests: path.resolve(__dirname, "./src/tests"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});