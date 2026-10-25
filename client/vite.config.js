import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In development the API runs on :5000; proxying keeps cookies first-party.
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
});
