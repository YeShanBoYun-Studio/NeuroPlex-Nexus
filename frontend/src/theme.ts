import { createTheme as createMuiTheme } from '@mui/material/styles';
import type { ThemeMode } from './types/theme';

const statusColors = {
  success: '#4caf50',
  info: '#2196f3',
  warning: '#ff9800',
  danger: '#f44336',
};

const neutralPalette = {
  main: '#64748B',
  light: '#94A3B8',
  dark: '#475569',
  contrastText: '#fff',
};

export function createTheme(mode: ThemeMode) {
  const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return createMuiTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#fff',
      },
      secondary: {
        main: '#dc004e',
        light: '#ff4081',
        dark: '#9a0036',
        contrastText: '#fff',
      },
      neutral: neutralPalette,
      background: {
        default: isDark ? '#121212' : '#ffffff',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
    },
    status: statusColors,
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? '#6b6b6b #2b2b2b' : '#959595 #f5f5f5',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
              backgroundColor: isDark ? '#2b2b2b' : '#f5f5f5',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: isDark ? '#6b6b6b' : '#959595',
              minHeight: 24,
            },
            '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
              backgroundColor: isDark ? '#959595' : '#6b6b6b',
            },
            '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
              backgroundColor: isDark ? '#959595' : '#6b6b6b',
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: isDark ? '#959595' : '#6b6b6b',
            },
            '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
              backgroundColor: isDark ? '#2b2b2b' : '#f5f5f5',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          standardSuccess: {
            backgroundColor: isDark ? '#1b3724' : '#edf7ed',
            color: isDark ? '#fff' : undefined,
          },
          standardInfo: {
            backgroundColor: isDark ? '#1d353e' : '#e5f6fd',
            color: isDark ? '#fff' : undefined,
          },
          standardWarning: {
            backgroundColor: isDark ? '#3e2e1e' : '#fff4e5',
            color: isDark ? '#fff' : undefined,
          },
          standardError: {
            backgroundColor: isDark ? '#3e1e1e' : '#fdeded',
            color: isDark ? '#fff' : undefined,
          },
        },
      },
    },
  });
}

export default createTheme;
