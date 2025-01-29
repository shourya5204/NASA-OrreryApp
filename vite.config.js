import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  base: '/NASA-OrreryApp/',  // Replace with your repository name
});
