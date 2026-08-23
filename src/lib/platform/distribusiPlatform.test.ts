import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

describe('kontrak distribusi Android', () => {
  it('memakai package ID dan versi awal yang stabil', () => {
    const capacitor = readFileSync(resolve(root, 'capacitor.config.ts'), 'utf8');
    const gradle = readFileSync(resolve(root, 'android', 'app', 'build.gradle'), 'utf8');
    expect(capacitor).toContain("appId: 'id.sch.sdnsatriajaya01.papaninteraktifsd'");
    expect(gradle).toContain('applicationId "id.sch.sdnsatriajaya01.papaninteraktifsd"');
    expect(gradle).toContain("project.findProperty('PISD_VERSION_CODE') ?: '1'");
    expect(gradle).toContain("project.findProperty('PISD_VERSION_NAME') ?: '1.0.0'");
    expect(gradle).toContain('versionCode appVersionCode');
    expect(gradle).toContain('versionName appVersionName');
  });

  it('menjaga data saat update dan tidak mengunci orientasi', () => {
    const capacitor = readFileSync(resolve(root, 'capacitor.config.ts'), 'utf8');
    const manifest = readFileSync(
      resolve(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'),
      'utf8',
    );
    expect(manifest).toContain('android:allowBackup="true"');
    expect(manifest).toContain('android:windowSoftInputMode="adjustResize"');
    expect(manifest).not.toContain('android:screenOrientation=');
    expect(capacitor).toContain("style: 'LIGHT'");
  });

  it('tetap mengirim dataset kurikulum yang dibutuhkan saat build Vercel', () => {
    const vercelIgnore = readFileSync(resolve(root, '.vercelignore'), 'utf8');
    expect(vercelIgnore.split(/\r?\n/)).not.toContain('uploads');
  });

  it('mengambil secret signing dari berkas lokal atau environment tanpa memasukkannya ke Git', () => {
    const gradle = readFileSync(resolve(root, 'android', 'app', 'build.gradle'), 'utf8');
    const gitignore = readFileSync(resolve(root, '.gitignore'), 'utf8');
    expect(gradle).toContain("System.getenv('PISD_KEYSTORE_PATH')");
    expect(gradle).toContain("rootProject.file('keystore.properties')");
    expect(gitignore).toContain('android/keystore.properties');
    expect(gitignore).toContain('*.jks');
  });
});
