import { useId, useState, type InputHTMLAttributes } from 'react';
import './kontrol.css';

type PropsDasar = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'>;

interface Props extends PropsDasar {
  label: string;
  bantuan?: string;
  galat?: string;
  /** Menambahkan tombol Lihat/Sembunyikan untuk isian sandi. */
  bisaDilihat?: boolean;
}

export function Isian({ label, bantuan, galat, bisaDilihat, type = 'text', ...sisa }: Props) {
  const id = useId();
  const idBantuan = `${id}-bantuan`;
  const idGalat = `${id}-galat`;
  const [terlihat, setTerlihat] = useState(false);

  const tipeAkhir = bisaDilihat ? (terlihat ? 'text' : 'password') : type;
  const dijelaskanOleh = [bantuan ? idBantuan : null, galat ? idGalat : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="kontrol">
      <label className="kontrol__label" htmlFor={id}>
        {label}
      </label>
      <div className="kontrol__kotak">
        <input
          {...sisa}
          id={id}
          type={tipeAkhir}
          className={`kontrol__isian${bisaDilihat ? ' kontrol__isian--dengan-aksi' : ''}`}
          aria-invalid={galat ? true : undefined}
          aria-describedby={dijelaskanOleh || undefined}
        />
        {bisaDilihat ? (
          <button
            type="button"
            className="kontrol__aksi"
            onClick={() => setTerlihat((nilai) => !nilai)}
            aria-pressed={terlihat}
          >
            {terlihat ? 'Sembunyikan' : 'Lihat'}
          </button>
        ) : null}
      </div>
      {bantuan ? (
        <p className="kontrol__bantuan" id={idBantuan}>
          {bantuan}
        </p>
      ) : null}
      {galat ? (
        <p className="kontrol__galat" id={idGalat}>
          {galat}
        </p>
      ) : null}
    </div>
  );
}
