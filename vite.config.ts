import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/` : '/'

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5173
  }
})
