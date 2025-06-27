
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Allows you to use '@/...' to refer to 'src/'
      '@': path.resolve(__dirname, 'src'),
    }
  },
  server: {
    port: 3001,
    open: true, // Automatically open the browser when the server starts
    hmr: {
      protocol: 'ws', // Ensures HMR works correctly on different networks
      host: 'localhost',
      port: 3001,
    }
  }
});
