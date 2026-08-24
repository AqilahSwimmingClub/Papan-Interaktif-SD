import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { KUNCI_PROVIDER_AI } from '../../lib/ai/aiService';
import { KonfigurasiAiScreen } from './KonfigurasiAiScreen';

describe('halaman konfigurasi AI Admin', () => {
  afterEach(() => { vi.restoreAllMocks(); localStorage.removeItem(KUNCI_PROVIDER_AI); });

  it('membaca status server dan menyimpan pilihan provider tanpa menyimpan secret', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ ok: true, status: { providerAktif: 'openai', provider: { openai: { tersedia: true, model: 'gpt-test' }, gemini: { tersedia: true, model: 'gemini-test' } }, endpoint: '/api/ai/generate' } }) } as Response);
    const pengguna = userEvent.setup();
    render(<MemoryRouter><KonfigurasiAiScreen/></MemoryRouter>);
    expect((await screen.findAllByText('✓ API key terdeteksi')).length).toBe(2);
    await pengguna.selectOptions(screen.getByLabelText('Provider AI'), 'gemini');
    await pengguna.click(screen.getByRole('button', { name: 'Simpan konfigurasi provider' }));
    expect(localStorage.getItem(KUNCI_PROVIDER_AI)).toBe('gemini');
    expect(document.body.textContent).not.toContain('nilai-api-key-rahasia');
  });
});
