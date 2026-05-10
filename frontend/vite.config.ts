import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../His/public',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/tenants': 'http://localhost:3000',
      '/patients': 'http://localhost:3000',
      '/proxy': 'http://localhost:3000',
      '/audit': 'http://localhost:3000',
      '/limits': 'http://localhost:3000',
    },
  },
})
