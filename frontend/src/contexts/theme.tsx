import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { ThemeMode } from '../types/theme';

interface ThemeContextValue {
  colorMode: ThemeMode;
  setColorMode: (mode: ThemeMode) => void;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get system preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Get stored preference or use system preference
  const [mode, setMode] = React.useState<ThemeMode>(() => {
    const stored = localStorage.getItem('theme') as ThemeMode;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return 'system';
  });

  // Calculate effective mode
  const effectiveMode = useMemo(() => {
    if (mode === 'system') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return mode;
  }, [mode, prefersDarkMode]);

  // Update stored preference
  const setColorMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  }, []);

  const toggleColorMode = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      return newMode;
    });
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: effectiveMode,
        },
      }),
    [effectiveMode]
  );

  const contextValue = useMemo(
    () => ({
      colorMode: mode,
      setColorMode,
      toggleColorMode,
    }),
    [mode, setColorMode, toggleColorMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
