import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { webcrypto } from 'node:crypto';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom tidak menyediakan Web Crypto lengkap; PBKDF2 memerlukan subtle.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
    writable: true,
  });
}

// jsdom tidak mengimplementasikan pemutaran media.
if (!HTMLMediaElement.prototype.play) {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
}
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

afterEach(() => {
  cleanup();
});
