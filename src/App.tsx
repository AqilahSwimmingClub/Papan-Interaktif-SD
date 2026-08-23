import { AuthProvider } from './state/AuthProvider';
import { ErrorBoundary } from './lib/errors/ErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <ErrorBoundary bagian="akar aplikasi">
      <AuthProvider>
        <ErrorBoundary bagian="rute">
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </ErrorBoundary>
  );
}
