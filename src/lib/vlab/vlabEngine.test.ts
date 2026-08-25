import { describe, expect, it } from 'vitest';
import {
  KEADAAN_AWAL_LIGHT_RAY,
  geserLubang,
  hitungLightRay,
  sejajarkanSemuaLubang,
} from './lightRayLab';
import { KEADAAN_AWAL_MIRROR, hitungMirror, putarCermin } from './mirrorLab';
import { BAHAN_UJI, KEADAAN_AWAL_MATERIAL, gantiBahan, hitungMaterial } from './materialLab';
import { KEADAAN_AWAL_SHADOW, geserBenda, hitungShadow } from './shadowLab';
import { KEADAAN_AWAL_REFRACTION, hitungRefraction, ubahSudutDatang } from './refractionLab';
import { KEADAAN_AWAL_COLOR_LIGHT, alihkanLampu, hitungColorLight } from './colorLightLab';
import { KEADAAN_AWAL_SOUND, gantiMediumBunyi, hitungSound } from './soundLab';
import { KEADAAN_AWAL_FOOD_CHAIN, alihkanOrganisme, hitungFoodChain } from './foodChainLab';
import { KEADAAN_AWAL_MAGNET, balikKutub, hitungMagnet } from './magnetLab';
import { KEADAAN_AWAL_CIRCUIT, alihkanLampuPutus, hitungCircuit } from './circuitLab';
import { KEADAAN_AWAL_EROSION, hitungErosion } from './erosionLab';
import { KEADAAN_AWAL_BREATHING, hitungBreathing } from './breathingLab';
import { KEADAAN_AWAL_ENVIRONMENT, hitungEnvironment } from './environmentLab';
import { KATALOG_VLAB } from './katalogVlab';

describe('Light Ray Lab', () => {
  it('meneruskan cahaya ke layar hanya ketika seluruh lubang sejajar', () => {
    const sejajar = hitungLightRay(sejajarkanSemuaLubang(KEADAAN_AWAL_LIGHT_RAY));
    expect(sejajar.sampaiLayar).toBe(true);
    expect(sejajar.papanPenghalang).toBeNull();
    expect(sejajar.papanLolos).toBe(3);

    const digeser = hitungLightRay(
      geserLubang(sejajarkanSemuaLubang(KEADAAN_AWAL_LIGHT_RAY), 'papan-2', 12),
    );
    expect(digeser.sampaiLayar).toBe(false);
    expect(digeser.papanPenghalang).toBe(1);
    expect(digeser.jarakBerkasBerhenti).toBeLessThan(sejajar.jarakBerkasBerhenti);
    expect(digeser.observasi).not.toBe(sejajar.observasi);
  });

  it('menghentikan lintasan saat senter dimatikan', () => {
    const mati = hitungLightRay({ ...KEADAAN_AWAL_LIGHT_RAY, senterMenyala: false });
    expect(mati.lintasan).toHaveLength(0);
    expect(mati.sampaiLayar).toBe(false);
  });
});

describe('Mirror Lab', () => {
  it('mengubah arah sinar pantul ketika cermin diputar', () => {
    const awal = hitungMirror(KEADAAN_AWAL_MIRROR);
    const diputar = hitungMirror(putarCermin(KEADAAN_AWAL_MIRROR, 65));

    expect(diputar.arahPantulGlobal).not.toBeCloseTo(awal.arahPantulGlobal, 1);
    expect(diputar.ujungPantul.x).not.toBeCloseTo(awal.ujungPantul.x, 1);
    expect(diputar.jarakKeTarget).not.toBeCloseTo(awal.jarakKeTarget, 1);
  });

  it('menjaga sudut pantul selalu sama dengan sudut datang', () => {
    for (const sudut of [0, 15, 40, 75, 120, 170]) {
      const hasil = hitungMirror(putarCermin(KEADAAN_AWAL_MIRROR, sudut));
      expect(hasil.sudutPantul).toBeCloseTo(hasil.sudutDatang, 6);
    }
  });

  it('menyatakan target tercapai saat sinar pantul melintasi target', () => {
    let terbaik = hitungMirror(KEADAAN_AWAL_MIRROR);
    let sudutTerbaik = KEADAAN_AWAL_MIRROR.sudutCermin;
    for (let sudut = 0; sudut < 180; sudut += 0.25) {
      const hasil = hitungMirror(putarCermin(KEADAAN_AWAL_MIRROR, sudut));
      if (hasil.jarakKeTarget < terbaik.jarakKeTarget) {
        terbaik = hasil;
        sudutTerbaik = sudut;
      }
    }
    expect(terbaik.kenaTarget).toBe(true);
    expect(sudutTerbaik).toBeGreaterThanOrEqual(0);
  });
});

describe('Material Lab', () => {
  it('memberi transmisi dan golongan berbeda untuk bahan berbeda', () => {
    const kaca = hitungMaterial(gantiBahan(KEADAAN_AWAL_MATERIAL, 'kaca-bening'));
    const kertas = hitungMaterial(gantiBahan(KEADAAN_AWAL_MATERIAL, 'kertas-minyak'));
    const kayu = hitungMaterial(gantiBahan(KEADAAN_AWAL_MATERIAL, 'kayu'));

    expect(kaca.kategori).toBe('transparan');
    expect(kertas.kategori).toBe('translusen');
    expect(kayu.kategori).toBe('opak');
    expect(kaca.transmisi).toBeGreaterThan(kertas.transmisi);
    expect(kertas.transmisi).toBeGreaterThan(kayu.transmisi);
    expect(kaca.bacaanSensor).toBeGreaterThan(kayu.bacaanSensor);
  });

  it('menurunkan transmisi saat bahan dipertebal', () => {
    const tipis = hitungMaterial({ ...KEADAAN_AWAL_MATERIAL, bahanKode: 'kertas-minyak', tebalMm: 2 });
    const tebal = hitungMaterial({ ...KEADAAN_AWAL_MATERIAL, bahanKode: 'kertas-minyak', tebalMm: 14 });
    expect(tebal.transmisi).toBeLessThan(tipis.transmisi);
  });

  it('menyediakan bahan transparan, translusen, dan opak pada daftar uji', () => {
    const kategori = new Set(
      BAHAN_UJI.map((bahan) => hitungMaterial({ ...KEADAAN_AWAL_MATERIAL, bahanKode: bahan.kode }).kategori),
    );
    expect(kategori).toEqual(new Set(['transparan', 'translusen', 'opak']));
  });
});

describe('Shadow Lab', () => {
  it('memperbesar bayangan ketika objek didekatkan ke lampu', () => {
    const jauh = hitungShadow(geserBenda(KEADAAN_AWAL_SHADOW, 'objek', 70));
    const dekat = hitungShadow(geserBenda(KEADAAN_AWAL_SHADOW, 'objek', 15));

    expect(dekat.tinggiUmbra).toBeGreaterThan(jauh.tinggiUmbra);
    expect(dekat.perbesaran).toBeGreaterThan(jauh.perbesaran);
    expect(dekat.observasi).not.toBe(jauh.observasi);
  });

  it('menambah lebar tepi kabur saat lampu diperbesar', () => {
    const kecil = hitungShadow({ ...KEADAAN_AWAL_SHADOW, diameterLampu: 1 });
    const besar = hitungShadow({ ...KEADAAN_AWAL_SHADOW, diameterLampu: 16 });
    expect(besar.lebarPenumbra).toBeGreaterThan(kecil.lebarPenumbra);
    expect(besar.ketajaman).not.toBe(kecil.ketajaman);
  });

  it('menolak susunan yang tidak sah', () => {
    const salah = hitungShadow({ ...KEADAAN_AWAL_SHADOW, posisiObjek: 2, posisiLampu: 40 });
    expect(salah.susunanSah).toBe(false);
    expect(salah.tinggiUmbra).toBe(0);
  });
});

describe('Refraction Lab', () => {
  it('mengubah sudut bias ketika sudut datang diubah', () => {
    const landai = hitungRefraction(ubahSudutDatang(KEADAAN_AWAL_REFRACTION, 10));
    const curam = hitungRefraction(ubahSudutDatang(KEADAAN_AWAL_REFRACTION, 70));

    expect(curam.sudutBias!).toBeGreaterThan(landai.sudutBias!);
    expect(curam.sudutBias!).toBeLessThan(70);
    expect(landai.arah).toBe('mendekati_normal');
  });

  it('membelokkan sinar menjauhi normal saat keluar ke medium renggang', () => {
    const hasil = hitungRefraction({
      ...KEADAAN_AWAL_REFRACTION,
      mediumAtasKode: 'kaca',
      mediumBawahKode: 'udara',
      sudutDatang: 20,
    });
    expect(hasil.arah).toBe('menjauhi_normal');
    expect(hasil.sudutBias!).toBeGreaterThan(20);
    expect(hasil.sudutKritis).toBeCloseTo(41.14, 1);
  });

  it('menghasilkan pemantulan sempurna melewati sudut kritis', () => {
    const hasil = hitungRefraction({
      ...KEADAAN_AWAL_REFRACTION,
      mediumAtasKode: 'kaca',
      mediumBawahKode: 'udara',
      sudutDatang: 60,
    });
    expect(hasil.pemantulanSempurna).toBe(true);
    expect(hasil.sudutBias).toBeNull();
  });
});

describe('Color Light Lab', () => {
  it('mengubah warna layar mengikuti kombinasi lampu', () => {
    const merahHijau = hitungColorLight(KEADAAN_AWAL_COLOR_LIGHT);
    expect(merahHijau.namaWarna).toBe('Kuning');

    const denganBiru = hitungColorLight(alihkanLampu(KEADAAN_AWAL_COLOR_LIGHT, 'biru'));
    expect(denganBiru.namaWarna).toBe('Putih');
    expect(denganBiru.warnaHex).not.toBe(merahHijau.warnaHex);
    expect(denganBiru.kecerahan).toBeGreaterThan(merahHijau.kecerahan);

    const tanpaHijau = hitungColorLight(alihkanLampu(KEADAAN_AWAL_COLOR_LIGHT, 'hijau'));
    expect(tanpaHijau.namaWarna).toBe('Merah');
  });

  it('menyaring kanal warna sesuai tapis yang dipasang', () => {
    const tapisMerah = hitungColorLight({ ...KEADAAN_AWAL_COLOR_LIGHT, tapisKode: 'merah' });
    expect(tapisMerah.namaWarna).toBe('Merah');
    expect(tapisMerah.rgb.g).toBeLessThan(20);
  });

  it('menggelapkan layar saat semua lampu dipadamkan', () => {
    const gelap = hitungColorLight({
      ...KEADAAN_AWAL_COLOR_LIGHT,
      lampuMenyala: { merah: false, hijau: false, biru: false },
    });
    expect(gelap.namaWarna).toBe('Hitam (layar gelap)');
    expect(gelap.kecerahan).toBe(0);
  });
});

describe('Sound Lab', () => {
  it('mengubah panjang gelombang saat medium diganti', () => {
    const udara = hitungSound(gantiMediumBunyi(KEADAAN_AWAL_SOUND, 'udara'));
    const besi = hitungSound(gantiMediumBunyi(KEADAAN_AWAL_SOUND, 'besi'));

    expect(besi.kecepatan).toBeGreaterThan(udara.kecepatan);
    expect(besi.panjangGelombang).toBeGreaterThan(udara.panjangGelombang);
    expect(besi.waktuTempuh).toBeLessThan(udara.waktuTempuh);
  });

  it('tidak merambatkan bunyi di ruang hampa', () => {
    const hampa = hitungSound(gantiMediumBunyi(KEADAAN_AWAL_SOUND, 'hampa'));
    expect(hampa.terdengar).toBe(false);
    expect(hampa.panjangGelombang).toBe(0);
    expect(hampa.bentukGelombang.every((titik) => titik.y === 0)).toBe(true);
  });

  it('menggolongkan nada dan batas dengar dari frekuensi', () => {
    expect(hitungSound({ ...KEADAAN_AWAL_SOUND, frekuensiHz: 10 }).kategoriNada).toBe('infrasonik');
    expect(hitungSound({ ...KEADAAN_AWAL_SOUND, frekuensiHz: 120 }).kategoriNada).toBe('rendah');
    expect(hitungSound({ ...KEADAAN_AWAL_SOUND, frekuensiHz: 30000 }).terdengar).toBe(false);
  });
});

describe('Food Chain Lab', () => {
  it('menjaga ekosistem lengkap tetap seimbang', () => {
    const utuh = hitungFoodChain(KEADAAN_AWAL_FOOD_CHAIN);
    expect(utuh.status).toBe('seimbang');
    expect(utuh.organismePunah).toEqual([]);
    expect(utuh.populasiAkhir.rumput).toBeGreaterThan(500);
  });

  it('mengubah populasi seluruh rantai saat satu organisme dihilangkan', () => {
    const utuh = hitungFoodChain(KEADAAN_AWAL_FOOD_CHAIN);
    const tanpaKatak = hitungFoodChain(alihkanOrganisme(KEADAAN_AWAL_FOOD_CHAIN, 'katak'));

    expect(tanpaKatak.populasiAkhir.katak).toBe(0);
    expect(tanpaKatak.populasiAkhir.belalang).not.toBe(utuh.populasiAkhir.belalang);
    expect(tanpaKatak.populasiAkhir.belalang).toBeGreaterThan(utuh.populasiAkhir.belalang);
    expect(tanpaKatak.populasiAkhir.ular).toBeLessThan(utuh.populasiAkhir.ular);
    expect(tanpaKatak.status).not.toBe('seimbang');
  });

  it('mencatat riwayat populasi untuk setiap musim', () => {
    const hasil = hitungFoodChain({ ...KEADAAN_AWAL_FOOD_CHAIN, musim: 5 });
    expect(hasil.riwayat).toHaveLength(6);
    expect(hasil.riwayat[0]!.rumput).toBe(1000);
  });

  it('meruntuhkan rantai ketika produsen dihilangkan', () => {
    const hasil = hitungFoodChain({
      ...alihkanOrganisme(KEADAAN_AWAL_FOOD_CHAIN, 'rumput'),
      musim: 12,
    });
    expect(hasil.status).toBe('runtuh');
    expect(hasil.organismePunah).toContain('belalang');
  });
});

describe('Magnet Lab', () => {
  it('membalik arah gaya saat salah satu kutub dibalik', () => {
    const tarik = hitungMagnet(KEADAAN_AWAL_MAGNET);
    const tolak = hitungMagnet(balikKutub(KEADAAN_AWAL_MAGNET, 'kanan'));

    expect(tarik.arah).toBe('tarik');
    expect(tolak.arah).toBe('tolak');
    expect(Math.sign(tarik.geseranMagnet)).not.toBe(Math.sign(tolak.geseranMagnet));
  });

  it('memperbesar gaya ketika jarak diperkecil', () => {
    const dekat = hitungMagnet({ ...KEADAAN_AWAL_MAGNET, jarakCm: 2 });
    const jauh = hitungMagnet({ ...KEADAAN_AWAL_MAGNET, jarakCm: 12 });
    expect(dekat.besarGaya).toBeGreaterThan(jauh.besarGaya * 4);
  });

  it('memisahkan bahan magnetis dari bahan bukan magnetis', () => {
    expect(hitungMagnet({ ...KEADAAN_AWAL_MAGNET, bahanUjiKode: 'besi' }).bahanTertarik).toBe(true);
    expect(hitungMagnet({ ...KEADAAN_AWAL_MAGNET, bahanUjiKode: 'plastik' }).bahanTertarik).toBe(false);
    expect(hitungMagnet({ ...KEADAAN_AWAL_MAGNET, bahanUjiKode: 'kayu' }).bahanTertarik).toBe(false);
  });
});

describe('Circuit Lab', () => {
  it('memadamkan seluruh lampu seri saat satu filamen putus', () => {
    const seri = hitungCircuit(KEADAAN_AWAL_CIRCUIT);
    const seriPutus = hitungCircuit(alihkanLampuPutus(KEADAAN_AWAL_CIRCUIT, 0));

    expect(seri.rangkaianTertutup).toBe(true);
    expect(seriPutus.rangkaianTertutup).toBe(false);
    expect(seriPutus.arusTotal).toBe(0);
    expect(seriPutus.terang[1]).toBe('padam');
  });

  it('menjaga lampu lain tetap menyala pada rangkaian paralel', () => {
    const paralel = { ...KEADAAN_AWAL_CIRCUIT, susunan: 'paralel' as const };
    const putus = hitungCircuit(alihkanLampuPutus(paralel, 0));

    expect(putus.terang[0]).toBe('putus');
    expect(putus.terang[1]).not.toBe('padam');
    expect(putus.rangkaianTertutup).toBe(true);
  });

  it('meredupkan lampu saat lampu seri ditambah dan menguatkan saat baterai ditambah', () => {
    const dua = hitungCircuit(KEADAAN_AWAL_CIRCUIT);
    const empat = hitungCircuit({ ...KEADAAN_AWAL_CIRCUIT, jumlahLampu: 4 });
    const lebihBaterai = hitungCircuit({ ...KEADAAN_AWAL_CIRCUIT, jumlahBaterai: 4 });

    expect(empat.dayaPerLampu).toBeLessThan(dua.dayaPerLampu);
    expect(lebihBaterai.dayaPerLampu).toBeGreaterThan(dua.dayaPerLampu);
  });

  it('memutus arus saat saklar dibuka', () => {
    const terbuka = hitungCircuit({ ...KEADAAN_AWAL_CIRCUIT, saklarTertutup: false });
    expect(terbuka.arusTotal).toBe(0);
    expect(terbuka.terang.every((nilai) => nilai === 'padam')).toBe(true);
  });
});

describe('Erosion Lab', () => {
  it('menurunkan erosi ketika tutupan vegetasi ditambah', () => {
    const gundul = hitungErosion({ ...KEADAAN_AWAL_EROSION, vegetasiPersen: 0 });
    const rimbun = hitungErosion({ ...KEADAAN_AWAL_EROSION, vegetasiPersen: 90 });

    expect(rimbun.tanahTerkikis).toBeLessThan(gundul.tanahTerkikis);
    expect(rimbun.kekeruhan).toBeLessThan(gundul.kekeruhan);
    expect(rimbun.sisaLapisanSubur).toBeGreaterThan(gundul.sisaLapisanSubur);
  });

  it('menambah erosi ketika lereng dibuat lebih curam', () => {
    const landai = hitungErosion({ ...KEADAAN_AWAL_EROSION, kemiringan: 5 });
    const curam = hitungErosion({ ...KEADAAN_AWAL_EROSION, kemiringan: 45 });
    expect(curam.tanahTerkikis).toBeGreaterThan(landai.tanahTerkikis);
    expect(curam.tingkat).not.toBe(landai.tingkat);
  });

  it('menghentikan erosi ketika hujan dimatikan', () => {
    const kering = hitungErosion({ ...KEADAAN_AWAL_EROSION, hujanMenyala: false });
    expect(kering.limpasan).toBe(0);
    expect(kering.tanahTerkikis).toBe(0);
  });
});

describe('Breathing Lab', () => {
  it('menaikkan ventilasi saat napas diperdalam dan dipercepat', () => {
    const tenang = hitungBreathing(KEADAAN_AWAL_BREATHING);
    const cepat = hitungBreathing({
      ...KEADAAN_AWAL_BREATHING,
      volumeTidalMl: 900,
      frekuensiPerMenit: 30,
    });

    expect(cepat.ventilasiSemenit).toBeGreaterThan(tenang.ventilasiSemenit);
    expect(cepat.ventilasiAlveolar).toBeGreaterThan(tenang.ventilasiAlveolar);
    expect(cepat.oksigenTerserap).toBeGreaterThan(tenang.oksigenTerserap);
  });

  it('menandai oksigen kurang saat aktivitas berat dengan napas tenang', () => {
    const berlari = hitungBreathing({ ...KEADAAN_AWAL_BREATHING, aktivitasKode: 'lari' });
    expect(berlari.status).toBe('kurang');
    expect(berlari.rasioKecukupan).toBeLessThan(1);
  });

  it('mengecilkan ventilasi efektif saat saluran napas menyempit', () => {
    const normal = hitungBreathing(KEADAAN_AWAL_BREATHING);
    const sempit = hitungBreathing({ ...KEADAAN_AWAL_BREATHING, penyempitanPersen: 60 });
    expect(sempit.volumeEfektifMl).toBeLessThan(normal.volumeEfektifMl);
    expect(sempit.ventilasiAlveolar).toBeLessThan(normal.ventilasiAlveolar);
  });

  it('menggerakkan diafragma mengikuti fase napas', () => {
    const tarik = hitungBreathing({ ...KEADAAN_AWAL_BREATHING, fase: 0.25 });
    const embus = hitungBreathing({ ...KEADAAN_AWAL_BREATHING, fase: 0.75 });
    expect(tarik.sedangMenarikNapas).toBe(true);
    expect(embus.sedangMenarikNapas).toBe(false);
    expect(tarik.skalaParu).toBeGreaterThan(embus.skalaParu);
  });
});

describe('Environment Lab', () => {
  it('menaikkan skor lingkungan saat pengelolaan sampah diperbaiki', () => {
    const buruk = hitungEnvironment({ ...KEADAAN_AWAL_ENVIRONMENT, pengelolaanPersen: 0 });
    const baik = hitungEnvironment({ ...KEADAAN_AWAL_ENVIRONMENT, pengelolaanPersen: 100 });

    expect(baik.sampahTercecer).toBeLessThan(buruk.sampahTercecer);
    expect(baik.skorLingkungan).toBeGreaterThan(buruk.skorLingkungan);
    expect(baik.indeksTanah).toBeGreaterThan(buruk.indeksTanah);
    expect(baik.kategori).not.toBe(buruk.kategori);
  });

  it('memperbaiki indeks udara saat pohon ditambah dan kendaraan dikurangi', () => {
    const padat = hitungEnvironment({
      ...KEADAAN_AWAL_ENVIRONMENT,
      jumlahPohon: 10,
      kendaraanBermotor: 500,
    });
    const hijau = hitungEnvironment({
      ...KEADAAN_AWAL_ENVIRONMENT,
      jumlahPohon: 600,
      kendaraanBermotor: 60,
    });
    expect(hijau.indeksUdara).toBeGreaterThan(padat.indeksUdara);
    expect(hijau.serapanKarbon).toBeGreaterThan(padat.serapanKarbon);
  });

  it('menurunkan daya hidup ikan saat limbah cair ditambah', () => {
    const bersih = hitungEnvironment({ ...KEADAAN_AWAL_ENVIRONMENT, limbahCairLiter: 0 });
    const tercemar = hitungEnvironment({ ...KEADAAN_AWAL_ENVIRONMENT, limbahCairLiter: 6000 });
    expect(tercemar.indeksAir).toBeLessThan(bersih.indeksAir);
    expect(tercemar.ikanBertahan).toBeLessThan(bersih.ikanBertahan);
  });
});

describe('pemisahan logika antar-VLAB', () => {
  it('memberi katalog dengan tujuan, alat, dan keluaran yang unik per lab', () => {
    expect(KATALOG_VLAB).toHaveLength(13);
    expect(new Set(KATALOG_VLAB.map((profil) => profil.kode)).size).toBe(KATALOG_VLAB.length);
    expect(new Set(KATALOG_VLAB.map((profil) => profil.tujuan)).size).toBe(KATALOG_VLAB.length);
    expect(new Set(KATALOG_VLAB.map((profil) => profil.alat.join('|'))).size).toBe(
      KATALOG_VLAB.length,
    );
    expect(new Set(KATALOG_VLAB.map((profil) => profil.keluaran.join('|'))).size).toBe(
      KATALOG_VLAB.length,
    );
  });

  it('menghasilkan bentuk keluaran yang berbeda untuk setiap engine', () => {
    const kunci = [
      Object.keys(hitungLightRay(KEADAAN_AWAL_LIGHT_RAY)),
      Object.keys(hitungMirror(KEADAAN_AWAL_MIRROR)),
      Object.keys(hitungMaterial(KEADAAN_AWAL_MATERIAL)),
      Object.keys(hitungShadow(KEADAAN_AWAL_SHADOW)),
      Object.keys(hitungRefraction(KEADAAN_AWAL_REFRACTION)),
      Object.keys(hitungColorLight(KEADAAN_AWAL_COLOR_LIGHT)),
      Object.keys(hitungSound(KEADAAN_AWAL_SOUND)),
      Object.keys(hitungFoodChain(KEADAAN_AWAL_FOOD_CHAIN)),
      Object.keys(hitungMagnet(KEADAAN_AWAL_MAGNET)),
      Object.keys(hitungCircuit(KEADAAN_AWAL_CIRCUIT)),
      Object.keys(hitungErosion(KEADAAN_AWAL_EROSION)),
      Object.keys(hitungBreathing(KEADAAN_AWAL_BREATHING)),
      Object.keys(hitungEnvironment(KEADAAN_AWAL_ENVIRONMENT)),
    ].map((daftar) => daftar.sort().join(','));

    expect(new Set(kunci).size).toBe(kunci.length);
  });

  it('memberi observasi dan kesimpulan yang berbeda untuk setiap lab', () => {
    const teks = [
      hitungLightRay(KEADAAN_AWAL_LIGHT_RAY),
      hitungMirror(KEADAAN_AWAL_MIRROR),
      hitungMaterial(KEADAAN_AWAL_MATERIAL),
      hitungShadow(KEADAAN_AWAL_SHADOW),
      hitungRefraction(KEADAAN_AWAL_REFRACTION),
      hitungColorLight(KEADAAN_AWAL_COLOR_LIGHT),
      hitungSound(KEADAAN_AWAL_SOUND),
      hitungFoodChain(KEADAAN_AWAL_FOOD_CHAIN),
      hitungMagnet(KEADAAN_AWAL_MAGNET),
      hitungCircuit(KEADAAN_AWAL_CIRCUIT),
      hitungErosion(KEADAAN_AWAL_EROSION),
      hitungBreathing(KEADAAN_AWAL_BREATHING),
      hitungEnvironment(KEADAAN_AWAL_ENVIRONMENT),
    ].map((hasil) => `${hasil.observasi}::${hasil.kesimpulan}`);

    expect(new Set(teks).size).toBe(teks.length);
    expect(teks.every((baris) => baris.length > 60)).toBe(true);
  });
});
