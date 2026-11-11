import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '../lib/queryClient.js';
import { ErrorBoundary } from '../components/common/ErrorBoundary.js';
import { api } from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const setSession = useAuthStore((state) => state.setSession);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  React.useEffect(() => {
    setIsLoading(true);
    void api
      .post('/auth/refresh')
      .then(({ data }) => setSession(data.data))
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [setIsLoading, setSession]);
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
