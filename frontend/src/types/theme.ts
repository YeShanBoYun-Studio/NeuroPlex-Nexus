export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  systemPreference: 'light' | 'dark';
}

export type ThemeAction =
  | { type: 'SET_MODE'; mode: ThemeMode }
  | { type: 'SET_SYSTEM_PREFERENCE'; preference: 'light' | 'dark' }
  | { type: 'TOGGLE_MODE' };

export interface ThemeConfig {
  defaultMode: ThemeMode;
  persistKey: string;
  storageType: 'localStorage' | 'sessionStorage';
}

export const defaultThemeConfig: ThemeConfig = {
  defaultMode: 'system',
  persistKey: 'theme',
  storageType: 'localStorage',
};

// Helper functions
export function isValidThemeMode(mode: string): mode is ThemeMode {
  return ['light', 'dark', 'system'].includes(mode);
}

export function getEffectiveMode(mode: ThemeMode, systemPreference: 'light' | 'dark'): 'light' | 'dark' {
  return mode === 'system' ? systemPreference : mode;
}
