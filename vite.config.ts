import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // VITE_BASE_PATH is injected by CI/deploy workflows.
  // Locally it falls back to '/' so dev server works normally.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
})