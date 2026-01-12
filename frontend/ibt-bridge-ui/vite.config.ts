import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // Instalează: npm install vite-plugin-node-polyfills -D

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(), // Aceasta va rezolva automat majoritatea erorilor de "Buffer" sau "Crypto"
  ],
  define: {
    // Definire globală pentru compatibilitate cu unele librării mai vechi
    'global': 'globalThis',
  },
});