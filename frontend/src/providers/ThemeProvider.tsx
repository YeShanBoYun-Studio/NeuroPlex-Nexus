import React from 'react';
import type { ThemeMode, ThemeContextValue } from '../types/theme';
import { configService } from '../services/config';

const defaultContext: ThemeContextValue = {
  mode: 'system',
  setMode: () => undefined,
  toggleTheme: () => undefined,
};

export const ThemeContext = React.createContext<ThemeContextValue>(defaultContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'system',
  storageKey = 'theme-mode',
}) => {
  const getInitialMode = (): ThemeMode => {
    const savedMode = localStorage.getItem(storageKey);
    if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
      return savedMode as ThemeMode;
    }
    return defaultMode;
  };

  const [mode, setModeState] = React.useState<ThemeMode>(getInitialMode);

  const setMode = React.useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(storageKey, newMode);

    // Apply theme class to document
    document.documentElement.dataset.theme = newMode;
    
    if (configService.isFeatureEnabled('debug')) {
      console.log('Theme changed:', newMode);
    }
  }, [storageKey]);

  const toggleTheme = React.useCallback(() => {
    const nextMode: Record<ThemeMode, ThemeMode> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    };
    setMode(nextMode[mode]);
  }, [mode, setMode]);

  const value = React.useMemo(
    () => ({
      mode,
      setMode,
      toggleTheme,
    }),
    [mode, setMode, toggleTheme]
  );

  React.useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
