import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useSnackbar } from 'notistack';
import { useLanguage } from '../contexts/LanguageContext';
import { HttpError } from '../utils/http';
import configService from '../services/config';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const { t, tk } = useLanguage();

  const queryClient = React.useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: (failureCount, error) => {
            if (error instanceof HttpError && error.statusCode >= 400) {
              return false;
            }
            return failureCount < 3;
          },
          gcTime: 5 * 60 * 1000, // 5 minutes
          staleTime: 30 * 1000, // 30 seconds
        },
        mutations: {
          retry: false,
          onError: (error: unknown) => {
            if (error instanceof HttpError) {
              const message = error.statusCode === 403
                ? t(tk.errors.unauthorized)
                : error.message || t(tk.errors.serverError);
              
              enqueueSnackbar(message, { 
                variant: 'error',
                autoHideDuration: 5000,
              });
            } else {
              enqueueSnackbar(t(tk.errors.serverError), {
                variant: 'error',
                autoHideDuration: 5000,
              });
            }
          },
        },
      },
    });
  }, [enqueueSnackbar, t, tk.errors.serverError, tk.errors.unauthorized]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {configService.isDevelopment() && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;
