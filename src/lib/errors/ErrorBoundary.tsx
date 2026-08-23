import { Component, type ErrorInfo, type ReactNode } from 'react';
import { LayarGalat } from '../../components/LayarGalat';
import { keAppError } from './AppError';
import { log } from './logger';

interface Props {
  children: ReactNode;
  /** Label sumber galat, dipakai di log agar mudah ditelusuri. */
  bagian?: string;
}

interface State {
  galat: Error | null;
}

/**
 * Penangkap galat render. Satu kartu boleh gagal tanpa menjatuhkan seluruh
 * layar (MASTER SPECIFICATION FINAL §13); pemakaian di akar menjaga agar guru
 * tidak pernah melihat layar putih.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { galat: null };

  static getDerivedStateFromError(galat: Error): State {
    return { galat };
  }

  componentDidCatch(galat: Error, info: ErrorInfo): void {
    log.galat(`Galat render pada ${this.props.bagian ?? 'aplikasi'}.`, {
      pesan: galat.message,
      komponen: info.componentStack,
    });
  }

  private muatUlang = (): void => {
    this.setState({ galat: null });
    globalThis.location?.reload();
  };

  render(): ReactNode {
    const { galat } = this.state;
    if (!galat) return this.props.children;

    const kesalahan = keAppError(galat);
    return (
      <LayarGalat
        kode={kesalahan.kode}
        judul="Aplikasi berhenti sejenak"
        pesan={kesalahan.message}
        aksi={
          <button type="button" className="layar-status__tombol" onClick={this.muatUlang}>
            Muat ulang aplikasi
          </button>
        }
      />
    );
  }
}
