import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3730a3',
      light: '#6366f1',
      dark: '#1e1b4b',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#fff',
    },
    success: {
      main: '#f59e0b',
    },
    background: {
      default: '#f1f5f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e1b4b',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { fontWeight: 'bold', textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(55,48,163,0.08)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          color: '#1e1b4b',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(90deg, #3730a3, #6366f1)',
          '&:hover': { background: 'linear-gradient(90deg, #1e1b4b, #3730a3)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderColor: '#3730a3', color: '#3730a3' },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#fff',
    },
    secondary: {
      main: '#06b6d4',
      light: '#67e8f9',
      dark: '#0e7490',
      contrastText: '#fff',
    },
    success: {
      main: '#34d399',
    },
    background: {
      default: '#0d0d1a',
      paper: '#1a0a2e',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    divider: '#2d1f4e',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { fontWeight: 'bold', textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1a0a2e',
          border: '1px solid #2d1f4e',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d0d1a',
          borderBottom: '1px solid #2d1f4e',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
          '&:hover': { background: 'linear-gradient(90deg, #6d28d9, #0891b2)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderColor: '#a78bfa', color: '#a78bfa' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: '#1a0a2e' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundColor: '#1a0a2e', border: '1px solid #2d1f4e' },
      },
    },
  },
});
