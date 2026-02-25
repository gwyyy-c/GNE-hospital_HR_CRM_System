import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Fix WebSocket HMR connection issues
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    // Proxy /api requests to XAMPP Apache (avoids CORS and routing issues)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1/GNE-Hospital-Management-System',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
})
