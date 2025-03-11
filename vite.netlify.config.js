import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  root: 'client', // Especificar el directorio raíz donde se encuentra index.html
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'), // Asegurarse de que las rutas alias estén correctamente definidas
    },
  },
  build: {
    outDir: '../dist', // Ajustado para que esté relativo a root
    // Specify ESM for Netlify to support top-level await
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'client/index.html') // Ruta explícita al index.html con un nombre de entrada
      },
      output: {
        format: 'esm',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      },
      external: [
        '@babel/preset-typescript/package.json',
        'lightningcss'
      ],
      preserveEntrySignatures: 'strict' // Preservar firmas de módulos para mejorar la compatibilidad
    }
  }
});