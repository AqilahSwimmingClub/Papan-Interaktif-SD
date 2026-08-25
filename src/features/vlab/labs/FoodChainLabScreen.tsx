import { useMemo, useState } from 'react';
import {
  KEADAAN_AWAL_FOOD_CHAIN,
  POPULASI_AWAL,
  RANTAI_MAKANAN,
  alihkanOrganisme,
  hitungFoodChain,
} from '../../../lib/vlab/foodChainLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab } from '../KerangkaVlab';

const TINGGI_GRAFIK = 46;

export function FoodChainLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_FOOD_CHAIN);
  const hasil = useMemo(() => hitungFoodChain(keadaan), [keadaan]);

  const puncak = Math.max(
    1,
    ...hasil.riwayat.flatMap((baris) => RANTAI_MAKANAN.map((item) => baris[item.kode])),
  );

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_FOOD_CHAIN)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      panggung={
        <svg
          viewBox="0 0 100 78"
          role="img"
          aria-label={`Grafik populasi ${keadaan.musim} musim, status ${hasil.labelStatus}`}
        >
          <rect width={100} height={78} fill="#f4f8f4" />

          {/* Kartu organisme dan panah arah makan */}
          {RANTAI_MAKANAN.filter((item) => item.tingkat > 0).map((organisme, indeks) => {
            const x = 6 + indeks * 18.6;
            const hilang = keadaan.dihilangkan.includes(organisme.kode);
            return (
              <g key={organisme.kode} opacity={hilang ? 0.28 : 1}>
                <rect x={x} y={4} width={16} height={16} rx={3} fill={organisme.warna} />
                <text x={x + 8} y={14} fontSize={7} textAnchor="middle">
                  {organisme.ikon}
                </text>
                <text x={x + 8} y={24} fontSize={3.1} fill="#35485a" textAnchor="middle">
                  {organisme.nama}
                </text>
                <text x={x + 8} y={28} fontSize={2.8} fill="#6a7b88" textAnchor="middle">
                  {hasil.populasiAkhir[organisme.kode]}
                </text>
                {hilang ? (
                  <line x1={x} y1={4} x2={x + 16} y2={20} stroke="#c9553a" strokeWidth={1.4} />
                ) : null}
                {indeks < 4 ? (
                  <path
                    d={`M ${x + 16.4} 12 L ${x + 18.2} 12`}
                    stroke="#6a7b88"
                    strokeWidth={0.9}
                    markerEnd=""
                  />
                ) : null}
              </g>
            );
          })}

          {/* Grafik populasi tiap musim */}
          <rect x={6} y={30} width={88} height={TINGGI_GRAFIK} fill="#fff" stroke="#dce5ea" />
          {RANTAI_MAKANAN.filter((item) => item.tingkat > 0).map((organisme) => {
            const jalur = hasil.riwayat
              .map((baris, indeks) => {
                const x = 6 + (indeks / Math.max(1, hasil.riwayat.length - 1)) * 88;
                const y = 30 + TINGGI_GRAFIK - (baris[organisme.kode] / puncak) * TINGGI_GRAFIK;
                return `${indeks === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
              })
              .join(' ');
            return (
              <path
                key={`garis-${organisme.kode}`}
                d={jalur}
                fill="none"
                stroke={organisme.warna}
                strokeWidth={1.2}
              />
            );
          })}
          <text x={8} y={34} fontSize={3} fill="#8a99a5">
            populasi
          </text>
          <text x={86} y={78} fontSize={3} fill="#8a99a5" textAnchor="end">
            musim ke-{keadaan.musim}
          </text>
        </svg>
      }
      kontrol={
        <>
          <div className="vlab-geser" role="group" aria-label="Organisme dalam ekosistem">
            <span className="vlab-geser__label">Organisme dalam ekosistem</span>
            <div className="vlab-pilihan">
              {RANTAI_MAKANAN.map((organisme) => (
                <button
                  key={organisme.kode}
                  type="button"
                  aria-pressed={!keadaan.dihilangkan.includes(organisme.kode)}
                  onClick={() => setKeadaan(alihkanOrganisme(keadaan, organisme.kode))}
                >
                  {organisme.ikon} {organisme.nama}
                </button>
              ))}
            </div>
          </div>
          <GeserVlab
            label="Jumlah musim"
            nilai={keadaan.musim}
            satuan=" musim"
            min={1}
            max={24}
            onUbah={(nilai) => setKeadaan({ ...keadaan, musim: nilai })}
          />
          <GeserVlab
            label="Populasi rumput awal"
            nilai={keadaan.populasi.rumput}
            min={100}
            max={1600}
            langkah={50}
            onUbah={(nilai) =>
              setKeadaan({ ...keadaan, populasi: { ...keadaan.populasi, rumput: nilai } })
            }
          />
          <GeserVlab
            label="Populasi belalang awal"
            nilai={keadaan.populasi.belalang}
            min={0}
            max={800}
            langkah={10}
            onUbah={(nilai) =>
              setKeadaan({ ...keadaan, populasi: { ...keadaan.populasi, belalang: nilai } })
            }
          />
        </>
      }
      bacaan={
        <>
          <p
            className={`vlab-status vlab-status--${
              hasil.status === 'seimbang' ? 'berhasil' : hasil.status === 'runtuh' ? 'gagal' : 'netral'
            }`}
            data-testid="food-chain-status"
          >
            {hasil.labelStatus}
          </p>
          <BacaanVlab
            daftar={RANTAI_MAKANAN.filter((item) => item.tingkat > 0).map((organisme) => ({
              label: organisme.nama,
              nilai: `${hasil.populasiAkhir[organisme.kode]} (${
                hasil.perubahanPersen[organisme.kode] >= 0 ? '+' : ''
              }${hasil.perubahanPersen[organisme.kode].toFixed(0)}%)`,
            }))}
          />
          <ul className="vlab-daftar-ringkas">
            <li>Populasi awal acuan: rumput {POPULASI_AWAL.rumput}, belalang {POPULASI_AWAL.belalang}.</li>
            {hasil.organismePunah.length ? (
              <li>Punah: {hasil.organismePunah.join(', ')}.</li>
            ) : null}
            {hasil.organismeMeledak.length ? (
              <li>Populasi meledak: {hasil.organismeMeledak.join(', ')}.</li>
            ) : null}
          </ul>
        </>
      }
    />
  );
}
