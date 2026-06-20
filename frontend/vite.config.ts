import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/static/',
  server: {
    proxy: {
      '/api': {
        target: 'https://zhonghui-competition-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
