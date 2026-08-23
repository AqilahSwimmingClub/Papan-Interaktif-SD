/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Akar proyek adalah akar repositori supaya berkas desain final di `assets/`
// (login-bg.png, opening.mp4, logo-tutwuri.png, logo-bekasi.png) dipakai
// langsung tanpa penggandaan. Berkas .dc.html desain tidak ikut dibundel.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    // Manifest bundle dibaca service worker untuk precache seluruh aset ber-hash.
    manifest: 'pwa-assets.json',
    rollupOptions: {
      output: {
        assetFileNames(aset) {
          // Manifest web app membutuhkan nama ikon stabil. Aset final tetap
          // berasal dari import Tentang Aplikasi dan tidak diubah gambarnya.
          if (aset.names.includes('logo-bekasi.png')) return 'assets/logo-bekasi.png';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
    // Semua test berbagi nama basis data IndexedDB yang sama. Jalankan file
    // secara serial agar reset database antarsuite tidak saling berlomba.
    fileParallelism: false,
    restoreMocks: true,
  },
});
