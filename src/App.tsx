import { AuthProvider } from './state/AuthProvider';
import { ErrorBoundary } from './lib/errors/ErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';
import { LayananFinalisasi } from './components/LayananFinalisasi';

export function App() {
  return (
    <ErrorBoundary bagian="akar aplikasi">
      <AuthProvider>
        <LayananFinalisasi />
        <ErrorBoundary bagian="rute">
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </ErrorBoundary>
  );
}
