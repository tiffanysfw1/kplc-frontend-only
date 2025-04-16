import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ✅ Remove or comment out rollupOptions
  // build: {
  //   rollupOptions: {
  //     external: ['jspdf'],
  //   },
  // },
})
