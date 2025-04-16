// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // remove external: ['jspdf']
    },
  },
});
