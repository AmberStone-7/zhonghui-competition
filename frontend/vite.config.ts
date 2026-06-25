import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  base: '/zhonghui-competition/',
  server: {
    proxy: {
      '/api': {
        target: 'https://zhonghui-competition-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    allowedHosts: ['.serveousercontent.com', '.trycloudflare.com', '.loca.lt']
  }
})
