import { defineConfig } from 'vite';

<<<<<<< HEAD
// https://vitejs.dev/config/
=======
>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
