import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from './contexts/theme';
import { LanguageProvider } from './contexts/LanguageContext';
import { QueryProvider } from './providers/QueryProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <SnackbarProvider 
            maxSnack={3}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <QueryProvider>
              <CssBaseline />
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </QueryProvider>
          </SnackbarProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
