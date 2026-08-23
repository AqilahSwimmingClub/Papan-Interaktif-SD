import type { Peran } from '../../../lib/types';
import './kontrol.css';

interface Props {
  nilai: Peran;
  onUbah: (peran: Peran) => void;
  label?: string;
}

const OPSI: ReadonlyArray<{ peran: Peran; label: string }> = [
  { peran: 'admin', label: 'Admin' },
  { peran: 'guru', label: 'Guru' },
];

/**
 * Peran menentukan hak, bukan keberadaan fitur: Guru tidak kehilangan satu pun
 * fitur pembelajaran (IMPLEMENTATION HANDOFF §4).
 */
export function PilihPeran({ nilai, onUbah, label = 'Pilih Peran' }: Props) {
  return (
    <div className="kontrol">
      <span className="kontrol__label" id="label-pilih-peran">
        {label}
      </span>
      <div className="pilih-peran" role="radiogroup" aria-labelledby="label-pilih-peran">
        {OPSI.map((opsi) => {
          const terpilih = nilai === opsi.peran;
          return (
            <button
              key={opsi.peran}
              type="button"
              role="radio"
              aria-checked={terpilih}
              className={`pilih-peran__opsi${terpilih ? ' pilih-peran__opsi--terpilih' : ''}`}
              onClick={() => onUbah(opsi.peran)}
            >
              <span className="pilih-peran__titik" aria-hidden="true" />
              {opsi.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
