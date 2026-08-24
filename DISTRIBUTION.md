# Distribusi Website/PWA dan Android

Konfigurasi ini membungkus build web yang sama (`dist`) dengan Capacitor. Tidak ada basis kode atau database Android terpisah.

## Identitas Android yang tidak boleh berubah

- Application ID: `id.sch.sdnsatriajaya01.papaninteraktifsd`
- Alias signing: `papan-interaktif-sd`
- Versi awal: `versionName 1.0.0`, `versionCode 1`

Rilis berikutnya wajib mempertahankan application ID dan keystore yang sama. Naikkan `versionCode` pada setiap rilis (`1.0.1` → `2`, `1.0.2` → `3`). Update Android normal tidak menghapus IndexedDB, Preferences, atau file aplikasi selama application ID dan signing key tetap sama dan aplikasi tidak di-uninstall/clear data.

Versi update dapat diuji tanpa mengubah default versi awal:

```text
cd android
gradlew.bat assembleRelease -PPISD_VERSION_NAME=1.0.1 -PPISD_VERSION_CODE=2
```

## Signing release

Secret tidak berada di repository. Gradle membaca `android/keystore.properties` (diabaikan Git) atau environment berikut:

- `PISD_KEYSTORE_PATH`
- `PISD_KEYSTORE_PASSWORD`
- `PISD_KEY_ALIAS`
- `PISD_KEY_PASSWORD`

Format lokal `android/keystore.properties`:

```properties
storeFile=C:/lokasi/aman/papan-interaktif-sd-release.jks
storePassword=<secret-lokal>
keyAlias=papan-interaktif-sd
keyPassword=<secret-lokal>
```

## Perintah

```text
npm run build
npm run android:sync
npm run android:debug
npm run android:release
```

`android:release` menghasilkan APK signed dan AAB jika konfigurasi signing tersedia. Jangan commit keystore, properties signing, folder `.vercel`, atau hasil build Android.
