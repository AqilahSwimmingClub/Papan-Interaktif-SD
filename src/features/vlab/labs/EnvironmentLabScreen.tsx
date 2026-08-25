import { useMemo, useState } from 'react';
import {
  KEADAAN_AWAL_ENVIRONMENT,
  hitungEnvironment,
} from '../../../lib/vlab/environmentLab';
import type { ProfilVlab } from '../../../lib/vlab/katalogVlab';
import { BacaanVlab, GeserVlab, KerangkaVlab } from '../KerangkaVlab';

export function EnvironmentLabScreen({ profil }: { profil: ProfilVlab }) {
  const [keadaan, setKeadaan] = useState(KEADAAN_AWAL_ENVIRONMENT);
  const hasil = useMemo(() => hitungEnvironment(keadaan), [keadaan]);

  const warnaSungai = `rgb(${Math.round(210 - hasil.indeksAir * 1.2)}, ${Math.round(120 + hasil.indeksAir)}, ${Math.round(90 + hasil.indeksAir * 1.3)})`;
  const kabut = Math.max(0, (100 - hasil.indeksUdara) / 160);
  const jumlahPohon = Math.min(14, Math.round(keadaan.jumlahPohon / 45));
  const tumpukanSampah = Math.min(12, Math.round(hasil.sampahTercecer / 30));

  return (
    <KerangkaVlab
      profil={profil}
      onReset={() => setKeadaan(KEADAAN_AWAL_ENVIRONMENT)}
      observasi={hasil.observasi}
      kesimpulan={hasil.kesimpulan}
      panggung={
        <svg
          viewBox="0 0 100 68"
          role="img"
          aria-label={`Skor lingkungan ${hasil.skorLingkungan.toFixed(0)} dari 100`}
        >
          <rect width={100} height={40} fill="#bfe0f5" />
          <rect width={100} height={40} fill="#8a8f94" opacity={kabut} />
          <rect y={40} width={100} height={28} fill="#8fbf76" />

          {/* Sungai */}
          <path d="M 0 48 Q 30 44 52 52 Q 74 60 100 54 L 100 62 Q 74 68 52 60 Q 30 52 0 56 Z" fill={warnaSungai} />
          {hasil.ikanBertahan > 40
            ? Array.from({ length: Math.round(hasil.ikanBertahan / 22) }, (_, indeks) => (
                <text key={`ikan-${indeks}`} x={14 + indeks * 20} y={57} fontSize={4}>
                  🐟
                </text>
              ))
            : (
              <text x={50} y={57} fontSize={3.4} fill="#3a2c1f" textAnchor="middle">
                ikan sulit bertahan
              </text>
            )}

          {/* Pepohonan */}
          {Array.from({ length: jumlahPohon }, (_, indeks) => (
            <text key={`pohon-${indeks}`} x={4 + indeks * 7} y={46} fontSize={5}>
              🌳
            </text>
          ))}

          {/* Rumah dan kendaraan */}
          <text x={8} y={38} fontSize={6}>
            🏠
          </text>
          <text x={20} y={38} fontSize={6}>
            🏫
          </text>
          {Array.from({ length: Math.min(6, Math.round(keadaan.kendaraanBermotor / 90)) }, (_, indeks) => (
            <text key={`kendaraan-${indeks}`} x={34 + indeks * 8} y={38} fontSize={5}>
              🚗
            </text>
          ))}

          {/* Sampah tercecer */}
          {Array.from({ length: tumpukanSampah }, (_, indeks) => (
            <text key={`sampah-${indeks}`} x={6 + indeks * 7.5} y={66} fontSize={4}>
              🗑️
            </text>
          ))}

          <text x={50} y={10} fontSize={5} fill="#1f3a4d" textAnchor="middle">
            Skor lingkungan {hasil.skorLingkungan.toFixed(0)} / 100
          </text>
          <text x={50} y={17} fontSize={3.6} fill="#2c4a5e" textAnchor="middle">
            {hasil.labelKategori}
          </text>
        </svg>
      }
      kontrol={
        <>
          <GeserVlab
            label="Sampah warga"
            nilai={keadaan.sampahKgPerHari}
            satuan=" kg/hari"
            min={0}
            max={900}
            langkah={25}
            onUbah={(nilai) => setKeadaan({ ...keadaan, sampahKgPerHari: nilai })}
          />
          <GeserVlab
            label="Sampah terkelola"
            nilai={keadaan.pengelolaanPersen}
            satuan="%"
            min={0}
            max={100}
            langkah={5}
            onUbah={(nilai) => setKeadaan({ ...keadaan, pengelolaanPersen: nilai })}
          />
          <GeserVlab
            label="Jumlah pohon"
            nilai={keadaan.jumlahPohon}
            satuan=" pohon"
            min={0}
            max={700}
            langkah={20}
            onUbah={(nilai) => setKeadaan({ ...keadaan, jumlahPohon: nilai })}
          />
          <GeserVlab
            label="Limbah cair ke sungai"
            nilai={keadaan.limbahCairLiter}
            satuan=" L/hari"
            min={0}
            max={7000}
            langkah={100}
            onUbah={(nilai) => setKeadaan({ ...keadaan, limbahCairLiter: nilai })}
          />
          <GeserVlab
            label="Kendaraan bermotor"
            nilai={keadaan.kendaraanBermotor}
            satuan=" unit"
            min={0}
            max={700}
            langkah={10}
            onUbah={(nilai) => setKeadaan({ ...keadaan, kendaraanBermotor: nilai })}
          />
        </>
      }
      bacaan={
        <>
          <p
            className={`vlab-status vlab-status--${
              hasil.skorLingkungan >= 70 ? 'berhasil' : hasil.skorLingkungan >= 50 ? 'netral' : 'gagal'
            }`}
            data-testid="environment-kategori"
          >
            {hasil.labelKategori}
          </p>
          <BacaanVlab
            daftar={[
              { label: 'Indeks air', nilai: hasil.indeksAir.toFixed(0) },
              { label: 'Indeks udara', nilai: hasil.indeksUdara.toFixed(0) },
              { label: 'Indeks tanah', nilai: hasil.indeksTanah.toFixed(0) },
              { label: 'Sampah tercecer', nilai: `${hasil.sampahTercecer.toFixed(0)} kg/hari` },
              { label: 'Serapan karbon', nilai: `${hasil.serapanKarbon.toFixed(1)} kg/hari` },
              { label: 'Ikan bertahan', nilai: `${hasil.ikanBertahan.toFixed(0)}%` },
            ]}
          />
        </>
      }
    />
  );
}
