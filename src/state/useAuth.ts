import { useContext } from 'react';
import { AuthContext, type NilaiAuth } from './AuthContext';

export function useAuth(): NilaiAuth {
  const nilai = useContext(AuthContext);
  if (!nilai) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  }
  return nilai;
}
