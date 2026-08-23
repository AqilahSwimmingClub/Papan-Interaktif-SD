import type { ReactNode } from 'react';
import './kontrol.css';

interface Props {
  jenis: 'galat' | 'info' | 'berhasil';
  judul?: string;
  children: ReactNode;
}

export function KotakPesan({ jenis, judul, children }: Props) {
  return (
    <div
      className={`kotak-pesan kotak-pesan--${jenis}`}
      role={jenis === 'galat' ? 'alert' : 'status'}
      aria-live={jenis === 'galat' ? 'assertive' : 'polite'}
    >
      {judul ? <p className="kotak-pesan__judul">{judul}</p> : null}
      <p>{children}</p>
    </div>
  );
}
