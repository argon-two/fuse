import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist/renderer'
  },
  server: {
    port: 5173,
    open: true,  // Автоматически открывать в браузере
    host: true   // Разрешить доступ из локальной сети
  }
});
