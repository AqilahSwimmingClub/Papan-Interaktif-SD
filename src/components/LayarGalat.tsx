import type { ReactNode } from 'react';
import './layar-status.css';

interface Props {
  judul: string;
  pesan: string;
  kode?: string;
  /** Pesan kosong dan galat selalu memuat satu tindakan yang dapat diambil. */
  aksi?: ReactNode;
}

export function LayarGalat({ judul, pesan, kode, aksi }: Props) {
  return (
    <div className="layar-status" role="alert">
      {kode ? <span className="layar-status__kode">{kode}</span> : null}
      <h1 className="layar-status__judul">{judul}</h1>
      <p className="layar-status__pesan">{pesan}</p>
      {aksi ? <div className="layar-status__aksi">{aksi}</div> : null}
    </div>
  );
}
