/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // A API não habilita CORS: em dev, /v1 (e as imagens em /uploads) vão para o backend.
    proxy: { '/v1': 'http://localhost:3000', '/uploads': 'http://localhost:3000' },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['**/node_modules/**', 'e2e/**'],
  },
})
