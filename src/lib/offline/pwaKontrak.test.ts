import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('kontrak PWA produksi', () => {
  it('memiliki manifest installable dengan ikon persegi final', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), 'public', 'manifest.webmanifest'), 'utf8'),
    ) as {
      display: string;
      start_url: string;
      scope: string;
      icons: Array<{ src: string; sizes: string; type: string; purpose: string }>;
    };
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.icons).toContainEqual({
      src: '/icons/app-icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    });
    expect(manifest.icons).toContainEqual({
      src: '/icons/app-icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    });
    expect(manifest.icons).toContainEqual({
      src: '/icons/app-icon-maskable-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    });
    for (const icon of manifest.icons) {
      expect(existsSync(resolve(process.cwd(), 'public', icon.src.slice(1)))).toBe(true);
    }
  });

  it('mengunci aset ikon pada logo resmi yang diberikan untuk distribusi', () => {
    const logo = readFileSync(resolve(process.cwd(), 'assets', 'app-logo.png'));
    const hash = createHash('sha256').update(logo).digest('hex');
    expect(hash).toBe('442494e827e80b6ab46d191cc42bc786164515946ffeb306c9b8d722adca7163');
  });

  it('mem-pracache daftar bundle dan mendukung fallback navigasi serta video rentang', () => {
    const serviceWorker = readFileSync(resolve(process.cwd(), 'public', 'sw.js'), 'utf8');
    expect(serviceWorker).toContain('pwa-assets.json');
    expect(serviceWorker).toContain("addEventListener('install'");
    expect(serviceWorker).toContain("addEventListener('fetch'");
    expect(serviceWorker).toContain("dalamScope('index.html')");
    expect(serviceWorker).toContain("'Content-Range'");
    expect(serviceWorker).toContain("'./icons/app-icon-512.png'");
  });

  it('menyediakan fallback SPA dan header service worker untuk Vercel', () => {
    const vercel = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
      outputDirectory: string;
      rewrites: Array<{ source: string; destination: string }>;
      headers: Array<{ source: string }>;
    };
    expect(vercel.outputDirectory).toBe('dist');
    expect(vercel.rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' });
    expect(vercel.headers.some((header) => header.source === '/sw.js')).toBe(true);
  });
});
