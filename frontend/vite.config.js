import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Allow external connections
    allowedHosts: [
      'localhost',
      '.ngrok-free.dev',
      'dominik-unabiding-venously.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'https://craftconnect-laravel-backend-2.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/storage': {
        target: 'https://craftconnect-laravel-backend-2.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/images': {
        target: 'https://craftconnect-laravel-backend-2.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
  }
})
