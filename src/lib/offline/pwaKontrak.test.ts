import { readFileSync } from 'node:fs';
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
      icons: Array<{ src: string; sizes: string; type: string }>;
    };
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.icons).toContainEqual({
      src: '/assets/logo-bekasi.png',
      sizes: '950x950',
      type: 'image/png',
      purpose: 'any',
    });
  });

  it('mem-pracache daftar bundle dan mendukung fallback navigasi serta video rentang', () => {
    const serviceWorker = readFileSync(resolve(process.cwd(), 'public', 'sw.js'), 'utf8');
    expect(serviceWorker).toContain('pwa-assets.json');
    expect(serviceWorker).toContain("addEventListener('install'");
    expect(serviceWorker).toContain("addEventListener('fetch'");
    expect(serviceWorker).toContain("dalamScope('index.html')");
    expect(serviceWorker).toContain("'Content-Range'");
  });
});
