import { use } from 'react';
import { KurikulumContext } from './KurikulumContext';

export function useKurikulum() {
  const nilai = use(KurikulumContext);
  if (!nilai) throw new Error('useKurikulum harus dipakai di dalam KurikulumProvider.');
  return nilai;
}
