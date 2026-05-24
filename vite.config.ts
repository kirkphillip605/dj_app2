import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import 'dotenv/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    // Port can be overridden via VITE_FRONTEND_PORT in .env (default 5173)
    port: Number(process.env.VITE_FRONTEND_PORT) || 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.BACKEND_PORT || 4000}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
