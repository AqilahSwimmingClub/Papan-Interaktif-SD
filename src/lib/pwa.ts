export type StatusPemasanganPwa = 'terpasang' | 'siap_dipasang' | 'melalui_browser';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let promptTertunda: BeforeInstallPromptEvent | null = null;
let pemantauanDimulai = false;
const pendengar = new Set<() => void>();

function beriTahu() {
  for (const dengar of pendengar) dengar();
}

export function pwaTerpasang(): boolean {
  const navigatorIos = navigator as Navigator & { standalone?: boolean };
  return Boolean(
    navigatorIos.standalone || globalThis.matchMedia?.('(display-mode: standalone)').matches,
  );
}

export function statusPemasanganPwa(): StatusPemasanganPwa {
  if (pwaTerpasang()) return 'terpasang';
  return promptTertunda ? 'siap_dipasang' : 'melalui_browser';
}

export function mulaiPemantauanPwa(): void {
  if (pemantauanDimulai) return;
  pemantauanDimulai = true;
  globalThis.addEventListener?.('beforeinstallprompt', (peristiwa: Event) => {
    peristiwa.preventDefault();
    promptTertunda = peristiwa as BeforeInstallPromptEvent;
    beriTahu();
  });
  globalThis.addEventListener?.('appinstalled', () => {
    promptTertunda = null;
    beriTahu();
  });
}

export function pantauPemasanganPwa(pendengarBaru: () => void): () => void {
  pendengar.add(pendengarBaru);
  return () => pendengar.delete(pendengarBaru);
}

export async function pasangPwa(): Promise<'accepted' | 'dismissed' | 'tidak_tersedia'> {
  if (!promptTertunda) return 'tidak_tersedia';
  const prompt = promptTertunda;
  await prompt.prompt();
  const hasil = await prompt.userChoice;
  if (hasil.outcome === 'accepted') promptTertunda = null;
  beriTahu();
  return hasil.outcome;
}
