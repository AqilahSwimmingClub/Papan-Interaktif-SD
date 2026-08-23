import type { ReactElement, ReactNode } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../state/AuthProvider';
import { NAMA_BASIS_DATA, tutupBasisData } from '../lib/storage/db';
import { KUNCI_TOKEN } from '../lib/auth/authService';
import { KUNCI_OPENING } from '../lib/opening/pemutaranOpening';

/** Mengosongkan seluruh penyimpanan lokal agar tiap uji mulai dari nol. */
export async function resetPenyimpanan(): Promise<void> {
  await tutupBasisData();
  await new Promise<void>((selesai) => {
    const permintaan = globalThis.indexedDB.deleteDatabase(NAMA_BASIS_DATA);
    permintaan.onsuccess = () => selesai();
    permintaan.onerror = () => selesai();
    permintaan.onblocked = () => selesai();
  });
  globalThis.localStorage?.removeItem(KUNCI_TOKEN);
  globalThis.sessionStorage?.removeItem(KUNCI_OPENING);
}

interface OpsiRender {
  rute?: string;
}

export function renderDenganProvider(ui: ReactElement, opsi: OpsiRender = {}): RenderResult {
  const { rute = '/' } = opsi;
  return render(
    <MemoryRouter initialEntries={[rute]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

export function BungkusRute({ children, rute = '/' }: { children: ReactNode; rute?: string }) {
  return (
    <MemoryRouter initialEntries={[rute]}>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}
