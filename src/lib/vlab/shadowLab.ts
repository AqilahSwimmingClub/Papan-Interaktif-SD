/**
 * Shadow Lab — menyelidiki ukuran dan ketajaman bayangan.
 *
 * Alat: lampu berdiameter tertentu, objek buram, layar.
 * Variabel: posisi lampu, posisi objek, posisi layar, tinggi objek, diameter lampu.
 * Logika: perbandingan segitiga sebangun untuk umbra
 * (tinggi bayangan = tinggi objek × jarak layar/jarak objek) dan lebar penumbra
 * dari sumber cahaya yang tidak berupa titik. Tidak ada pemantulan di lab ini.
 */

export interface KeadaanShadow {
  /** Posisi lampu pada sumbu jarak, cm. */
  posisiLampu: number;
  posisiObjek: number;
  posisiLayar: number;
  /** Tinggi objek, cm. */
  tinggiObjek: number;
  /** Diameter lampu, cm. Semakin besar semakin kabur tepi bayangan. */
  diameterLampu: number;
  lampuMenyala: boolean;
}

export type KetajamanBayangan = 'tegas' | 'agak_kabur' | 'sangat_kabur';

export interface HasilShadow {
  /** Jarak lampu → objek, cm. */
  jarakLampuObjek: number;
  /** Jarak objek → layar, cm. */
  jarakObjekLayar: number;
  perbesaran: number;
  /** Tinggi bagian bayangan yang benar-benar gelap. */
  tinggiUmbra: number;
  /** Lebar tepi setengah bayang di satu sisi. */
  lebarPenumbra: number;
  tinggiTotalBayangan: number;
  ketajaman: KetajamanBayangan;
  labelKetajaman: string;
  susunanSah: boolean;
  observasi: string;
  kesimpulan: string;
}

export const KEADAAN_AWAL_SHADOW: KeadaanShadow = {
  posisiLampu: 5,
  posisiObjek: 40,
  posisiLayar: 95,
  tinggiObjek: 12,
  diameterLampu: 4,
  lampuMenyala: true,
};

const LABEL: Record<KetajamanBayangan, string> = {
  tegas: 'Tepi bayangan tegas',
  agak_kabur: 'Tepi bayangan agak kabur',
  sangat_kabur: 'Tepi bayangan sangat kabur',
};

/** Menghitung umbra dan penumbra dari susunan lampu, objek, dan layar. */
export function hitungShadow(keadaan: KeadaanShadow): HasilShadow {
  const jarakLampuObjek = keadaan.posisiObjek - keadaan.posisiLampu;
  const jarakObjekLayar = keadaan.posisiLayar - keadaan.posisiObjek;
  const susunanSah = jarakLampuObjek > 0 && jarakObjekLayar > 0 && keadaan.lampuMenyala;

  if (!susunanSah) {
    return {
      jarakLampuObjek,
      jarakObjekLayar,
      perbesaran: 0,
      tinggiUmbra: 0,
      lebarPenumbra: 0,
      tinggiTotalBayangan: 0,
      ketajaman: 'tegas',
      labelKetajaman: LABEL.tegas,
      susunanSah: false,
      observasi: keadaan.lampuMenyala
        ? 'Bayangan tidak terbentuk: urutan harus lampu → objek → layar.'
        : 'Lampu mati sehingga tidak ada bayangan yang terbentuk.',
      kesimpulan: 'Bayangan hanya muncul bila objek berada di antara sumber cahaya dan layar.',
    };
  }

  const perbesaran = (jarakLampuObjek + jarakObjekLayar) / jarakLampuObjek;
  const tinggiUmbra = keadaan.tinggiObjek * perbesaran;
  const lebarPenumbra = (keadaan.diameterLampu * jarakObjekLayar) / jarakLampuObjek;
  const rasioKabur = lebarPenumbra / Math.max(tinggiUmbra, 0.001);
  const ketajaman: KetajamanBayangan =
    rasioKabur < 0.12 ? 'tegas' : rasioKabur < 0.4 ? 'agak_kabur' : 'sangat_kabur';

  return {
    jarakLampuObjek,
    jarakObjekLayar,
    perbesaran,
    tinggiUmbra,
    lebarPenumbra,
    tinggiTotalBayangan: tinggiUmbra + lebarPenumbra,
    ketajaman,
    labelKetajaman: LABEL[ketajaman],
    susunanSah: true,
    observasi: `Objek setinggi ${keadaan.tinggiObjek} cm berjarak ${jarakLampuObjek} cm dari lampu menghasilkan bayangan gelap setinggi ${tinggiUmbra.toFixed(1)} cm (${perbesaran.toFixed(2)}×) dengan tepi kabur selebar ${lebarPenumbra.toFixed(1)} cm.`,
    kesimpulan:
      perbesaran > 2
        ? 'Semakin dekat objek ke lampu, bayangannya semakin besar karena berkas cahaya menyebar lebih lebar sebelum mencapai layar.'
        : 'Semakin jauh objek dari lampu dan semakin dekat ke layar, bayangannya menyusut mendekati ukuran benda aslinya.',
  };
}

/** Menggeser satu benda sambil menjaga urutan lampu → objek → layar. */
export function geserBenda(
  keadaan: KeadaanShadow,
  benda: 'lampu' | 'objek' | 'layar',
  posisi: number,
): KeadaanShadow {
  if (benda === 'lampu') {
    return { ...keadaan, posisiLampu: Math.min(posisi, keadaan.posisiObjek - 5) };
  }
  if (benda === 'objek') {
    return {
      ...keadaan,
      posisiObjek: Math.min(
        Math.max(posisi, keadaan.posisiLampu + 5),
        keadaan.posisiLayar - 5,
      ),
    };
  }
  return { ...keadaan, posisiLayar: Math.max(posisi, keadaan.posisiObjek + 5) };
}
