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
