import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import videoPembuka from '../../../assets/opening.mp4';
import { tandaiOpeningSelesai } from '../../lib/opening/pemutaranOpening';
import { log } from '../../lib/errors/logger';
import { RUTE } from '../../routes/paths';
import {
  BATAS_METADATA_MS,
  DURASI_TRANSISI_MS,
  MARGIN_BATAS_AMAN_MS,
  TENGGANG_AUTOPLAY_MS,
  pilihObjectFit,
} from './aturanOpening';
import './opening.css';

/**
 * Layar 28 — Opening.
 *
 * Aturan terkunci (Tahap 11 §28, M24):
 * • Sekali per pembukaan aplikasi, tidak melooping, TIDAK DAPAT DILEWATKAN.
 *   Tidak ada tombol Skip, Lewati, atau tutup; Esc, klik, dan sentuhan tidak
 *   melewatkan video. Satu-satunya jalan ke Login adalah video selesai.
 * • Dua pengaman wajib agar aturan itu tidak menjebak guru: video yang gagal
 *   dimuat langsung meneruskan ke Login, dan batas waktu aman durasi + 5 detik
 *   meneruskan sendiri bila peristiwa selesai tidak tiba.
 * • Rasio dipertahankan mutlak; bidang sisa diisi navy #071A2E.
 * • Autoplay berjalan tanpa suara dengan lencana untuk menyalakannya —
 *   aplikasi tidak pernah menunggu izin autoplay bersuara.
 */
export function OpeningScreen() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sudahLanjut = useRef(false);
  const pewaktuAman = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pewaktuTransisi = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pewaktuAutoplay = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain');
  const [bersuara, setBersuara] = useState(false);
  const [memudar, setMemudar] = useState(false);

  const lanjutKeLogin = useCallback(
    (alasan: string) => {
      if (sudahLanjut.current) return;
      sudahLanjut.current = true;
      if (pewaktuAman.current) clearTimeout(pewaktuAman.current);
      log.info(`Opening selesai (${alasan}); meneruskan ke lapisan Login.`);
      tandaiOpeningSelesai();
      setMemudar(true);
      pewaktuTransisi.current = setTimeout(() => {
        navigate(RUTE.akar, { replace: true });
      }, DURASI_TRANSISI_MS);
    },
    [navigate],
  );

  const pasangBatasAman = useCallback((milidetik: number) => {
    if (pewaktuAman.current) clearTimeout(pewaktuAman.current);
    pewaktuAman.current = setTimeout(() => {
      if (sudahLanjut.current) return;
      log.peringatan('Batas waktu aman Opening tercapai; meneruskan sendiri ke Login.');
      lanjutKeLogin('batas waktu aman');
    }, milidetik);
  }, [lanjutKeLogin]);

  const hitungObjectFit = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    const rasioLayar = globalThis.innerWidth / Math.max(globalThis.innerHeight, 1);
    setObjectFit(pilihObjectFit(video.videoWidth / video.videoHeight, rasioLayar));
  }, []);

  useEffect(() => {
    pasangBatasAman(BATAS_METADATA_MS);
    return () => {
      if (pewaktuAman.current) clearTimeout(pewaktuAman.current);
      if (pewaktuTransisi.current) clearTimeout(pewaktuTransisi.current);
      if (pewaktuAutoplay.current) clearTimeout(pewaktuAutoplay.current);
    };
  }, [pasangBatasAman]);

  useEffect(() => {
    globalThis.addEventListener('resize', hitungObjectFit);
    globalThis.addEventListener('orientationchange', hitungObjectFit);
    return () => {
      globalThis.removeEventListener('resize', hitungObjectFit);
      globalThis.removeEventListener('orientationchange', hitungObjectFit);
    };
  }, [hitungObjectFit]);

  // Autoplay selalu dimulai tanpa suara — peramban menolak autoplay bersuara
  // dan aplikasi tidak boleh macet menunggunya.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const hasil: unknown = video.play();
    if (hasil instanceof Promise) {
      hasil.catch((galat: unknown) => {
        log.peringatan('Janji autoplay Opening ditolak; menunggu masa tenggang.', galat);
        // Jangan langsung melompat: penolakan bukan berarti video tidak jalan.
        pewaktuAutoplay.current = setTimeout(() => {
          const sekarang = videoRef.current;
          if (sekarang && !sekarang.paused && sekarang.currentTime > 0) return;
          log.peringatan('Video Opening tidak dapat diputar; meneruskan ke Login.');
          lanjutKeLogin('autoplay tidak dapat dijalankan');
        }, TENGGANG_AUTOPLAY_MS);
      });
    }
  }, [lanjutKeLogin]);

  const saatMetadata = useCallback(() => {
    const video = videoRef.current;
    hitungObjectFit();
    const durasi = video?.duration;
    if (durasi && Number.isFinite(durasi)) {
      pasangBatasAman(durasi * 1000 + MARGIN_BATAS_AMAN_MS);
    }
  }, [hitungObjectFit, pasangBatasAman]);

  const saatGagal = useCallback(() => {
    // Kegagalan dicatat di log, bukan disodorkan kepada guru.
    log.galat('Video Opening gagal dimuat; meneruskan langsung ke Login.');
    lanjutKeLogin('video gagal dimuat');
  }, [lanjutKeLogin]);

  const nyalakanSuara = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setBersuara(true);
    const hasil: unknown = video.play();
    if (hasil instanceof Promise) {
      hasil.catch((galat: unknown) => {
        log.peringatan('Suara Opening gagal dinyalakan.', galat);
        video.muted = true;
        setBersuara(false);
      });
    }
  }, []);

  return (
    <div
      className={`opening${memudar ? ' opening--memudar' : ''}`}
      data-testid="layar-opening"
      role="presentation"
    >
      <video
        ref={videoRef}
        className="opening__video"
        style={{ objectFit }}
        data-object-fit={objectFit}
        src={videoPembuka}
        autoPlay
        muted
        loop={false}
        playsInline
        preload="auto"
        // Tanpa controls: tidak ada jalur cepat ke Login lewat pemutar.
        controls={false}
        disablePictureInPicture
        onLoadedMetadata={saatMetadata}
        onEnded={() => lanjutKeLogin('video selesai')}
        onError={saatGagal}
        aria-label="Video pembuka Papan Interaktif SD"
      />

      {!bersuara ? (
        <button type="button" className="opening__lencana-suara" onClick={nyalakanSuara}>
          Ketuk untuk suara
        </button>
      ) : null}
    </div>
  );
}
