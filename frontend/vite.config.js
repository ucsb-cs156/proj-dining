import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      main: path.resolve(__dirname, './src/main'),
      fixtures: path.resolve(__dirname, './src/fixtures'),
    },
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/html',
      include: ['src/main/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/setupTests.js'
      ]
    }
  }
})