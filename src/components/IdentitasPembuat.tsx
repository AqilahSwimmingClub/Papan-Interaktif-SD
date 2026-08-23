import './identitas-pembuat.css';

export const TEKS_IDENTITAS = {
  pengantar: 'Dirancang & Dikembangkan oleh',
  nama: 'FAHMI DJAWAS, S.Pd.',
  hakCipta: '© 2026 PAPAN INTERAKTIF SD — Semua Hak Dilindungi',
} as const;

export type UkuranIdentitas = 'ringkas' | 'normal' | 'besar';

interface Props {
  ukuran?: UkuranIdentitas;
  /** Garis pemisah di atas identitas. Dimatikan bila panel sudah punya garis. */
  bergaris?: boolean;
  className?: string;
}

/**
 * Identitas pembuat — komponen footer BERSAMA.
 *
 * Aturan terkunci (MASTER SPECIFICATION FINAL §14 M24, jebakan 19):
 * ketiga barisnya SATU kolom rata tengah pada setiap layar dan setiap titik
 * henti. Tata letak kiri-kanan atau space-between ditolak. Teks HTML hidup,
 * bukan piksel gambar, agar tidak pernah terpotong dan tetap terbaca pembaca
 * layar. Baris hak cipta selalu memuat kalimat utuh — boleh dipatah dua baris
 * pada bidang sempit, tidak boleh dipendekkan. Sekolah pengguna tidak dapat
 * menyembunyikannya.
 */
export function IdentitasPembuat({ ukuran = 'normal', bergaris = true, className }: Props) {
  const kelas = ['identitas-pembuat', `identitas-pembuat--${ukuran}`];
  if (bergaris) kelas.push('identitas-pembuat--bergaris');
  if (className) kelas.push(className);

  return (
    <div className={kelas.join(' ')} data-testid="identitas-pembuat">
      <p className="identitas-pembuat__pengantar">{TEKS_IDENTITAS.pengantar}</p>
      <p className="identitas-pembuat__nama">{TEKS_IDENTITAS.nama}</p>
      <p className="identitas-pembuat__hak-cipta">{TEKS_IDENTITAS.hakCipta}</p>
    </div>
  );
}
