import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    chunkSizeWarningLimit: 3000,
    outDir: 'dist', // Ensure the output directory is correctly set
  },
  server: {
    port: 3000, // Adjust the port if needed
  },
});
