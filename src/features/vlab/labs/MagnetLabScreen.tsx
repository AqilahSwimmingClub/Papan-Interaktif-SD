import { useMemo, useState } from 'react';
import {
  BAHAN_MAGNET,
  KEADAAN_AWAL_MAGNET,
  balikKutub,
  hitungMagnet,
} from '../../../lib/vlab/magnetLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab } from '../KerangkaVlab';

export function MagnetLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_MAGNET);
  const hasil = useMemo(() => hitungMagnet(keadaan), [keadaan]);

  const pusat = 50;
  const setengahJarak = keadaan.jarakCm * 1.5;
  const kiriUjung = pusat - setengahJarak;
  const kananUjung = pusat + setengahJarak + hasil.geseranMagnet * 1.5;
  const warnaKutub = (kutub: string) => (kutub === 'utara' ? '#d83a3a' : '#1b5e8c');

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_MAGNET)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      panggung={
        <svg
          viewBox="0 0 100 66"
          role="img"
          aria-label={`Magnet saling ${hasil.arah}, gaya ${hasil.besarGaya.toFixed(2)} satuan`}
        >
          <rect width={100} height={66} fill="#f6f4f1" />

          {/* Garis gaya antar kutub */}
          {hasil.garisGaya.map((garis, indeks) => (
            <path
              key={`gaya-${indeks}`}
              d={
                hasil.arah === 'tarik'
                  ? `M ${kiriUjung} 24 Q ${pusat} ${24 + garis.lengkung} ${kananUjung} 24`
                  : `M ${kiriUjung} 24 Q ${kiriUjung - 8} ${24 + garis.lengkung} ${kiriUjung - 14} 24`
              }
              fill="none"
              stroke="#8f7fd0"
              strokeWidth={0.7}
              opacity={0.7}
            />
          ))}
          {hasil.arah === 'tolak'
            ? hasil.garisGaya.map((garis, indeks) => (
                <path
                  key={`gaya-kanan-${indeks}`}
                  d={`M ${kananUjung} 24 Q ${kananUjung + 8} ${24 + garis.lengkung} ${kananUjung + 14} 24`}
                  fill="none"
                  stroke="#8f7fd0"
                  strokeWidth={0.7}
                  opacity={0.7}
                />
              ))
            : null}

          {/* Magnet kiri */}
          <g>
            <rect x={kiriUjung - 24} y={18} width={12} height={12} fill={warnaKutub(keadaan.kutubKiri === 'utara' ? 'selatan' : 'utara')} />
            <rect x={kiriUjung - 12} y={18} width={12} height={12} fill={warnaKutub(keadaan.kutubKiri)} />
            <text x={kiriUjung - 6} y={27} fontSize={6} fill="#fff" textAnchor="middle">
              {keadaan.kutubKiri === 'utara' ? 'U' : 'S'}
            </text>
          </g>

          {/* Magnet kanan */}
          <g>
            <rect x={kananUjung} y={18} width={12} height={12} fill={warnaKutub(keadaan.kutubKanan)} />
            <rect x={kananUjung + 12} y={18} width={12} height={12} fill={warnaKutub(keadaan.kutubKanan === 'utara' ? 'selatan' : 'utara')} />
            <text x={kananUjung + 6} y={27} fontSize={6} fill="#fff" textAnchor="middle">
              {keadaan.kutubKanan === 'utara' ? 'U' : 'S'}
            </text>
          </g>

          {/* Penggaris jarak */}
          <line x1={kiriUjung} y1={36} x2={kananUjung} y2={36} stroke="#6a7b88" strokeWidth={0.6} />
          <text x={(kiriUjung + kananUjung) / 2} y={40.5} fontSize={3.6} fill="#4a5c6b" textAnchor="middle">
            {keadaan.jarakCm} cm
          </text>
          <text x={pusat} y={11} fontSize={4.2} fill="#4a5c6b" textAnchor="middle">
            {hasil.arah === 'tarik' ? 'TARIK-MENARIK' : 'TOLAK-MENOLAK'}
          </text>

          {/* Kotak bahan uji */}
          <rect x={30} y={48} width={40} height={14} rx={2} fill="#fff" stroke="#d5dee6" />
          <text x={38} y={57} fontSize={7} textAnchor="middle">
            {hasil.bahanUji.ikon}
          </text>
          <text x={56} y={54} fontSize={3.4} fill="#35485a" textAnchor="middle">
            {hasil.bahanUji.nama}
          </text>
          <text
            x={56}
            y={59}
            fontSize={3.4}
            fill={hasil.bahanTertarik ? '#0f6b4f' : '#b14a2c'}
            textAnchor="middle"
          >
            {hasil.bahanTertarik ? 'tertarik magnet' : 'tidak tertarik'}
          </text>
        </svg>
      }
      kontrol={
        <>
          <button
            className="vlab-saklar"
            type="button"
            aria-pressed={keadaan.kutubKiri === 'utara'}
            onClick={() => setKeadaan(balikKutub(keadaan, 'kiri'))}
          >
            Kutub magnet kiri<b>{keadaan.kutubKiri === 'utara' ? 'UTARA' : 'SELATAN'}</b>
          </button>
          <button
            className="vlab-saklar"
            type="button"
            aria-pressed={keadaan.kutubKanan === 'utara'}
            onClick={() => setKeadaan(balikKutub(keadaan, 'kanan'))}
          >
            Kutub magnet kanan<b>{keadaan.kutubKanan === 'utara' ? 'UTARA' : 'SELATAN'}</b>
          </button>
          <GeserVlab
            label="Jarak antarmagnet"
            nilai={keadaan.jarakCm}
            satuan=" cm"
            min={1}
            max={16}
            onUbah={(nilai) => setKeadaan({ ...keadaan, jarakCm: nilai })}
          />
          <GeserVlab
            label="Kekuatan magnet kiri"
            nilai={keadaan.kekuatanKiri}
            min={1}
            max={10}
            onUbah={(nilai) => setKeadaan({ ...keadaan, kekuatanKiri: nilai })}
          />
          <GeserVlab
            label="Kekuatan magnet kanan"
            nilai={keadaan.kekuatanKanan}
            min={1}
            max={10}
            onUbah={(nilai) => setKeadaan({ ...keadaan, kekuatanKanan: nilai })}
          />
          <div className="vlab-geser" role="group" aria-label="Bahan uji">
            <span className="vlab-geser__label">Bahan uji</span>
            <div className="vlab-pilihan">
              {BAHAN_MAGNET.map((bahan) => (
                <button
                  key={bahan.kode}
                  type="button"
                  aria-pressed={bahan.kode === keadaan.bahanUjiKode}
                  onClick={() => setKeadaan({ ...keadaan, bahanUjiKode: bahan.kode })}
                >
                  {bahan.ikon} {bahan.nama}
                </button>
              ))}
            </div>
          </div>
        </>
      }
      bacaan={
        <>
          <p className="vlab-status vlab-status--netral" data-testid="magnet-arah">
            {hasil.labelArah}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Besar gaya', nilai: `${hasil.besarGaya.toFixed(2)} satuan` },
              { label: 'Arah gaya', nilai: hasil.arah === 'tarik' ? 'Mendekat' : 'Menjauh' },
              { label: 'Jangkauan tarik bahan', nilai: `${hasil.jangkauanTarikBahan.toFixed(1)} cm` },
              { label: 'Bahan uji', nilai: hasil.bahanTertarik ? 'Magnetis' : 'Bukan magnetis' },
            ]}
          />
        </>
      }
    />
  );
}
