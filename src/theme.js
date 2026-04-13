import { createTheme } from '@mui/material/styles';

/* ────────────────────────────────────────────────────────────
   PALETA FUTARK
   Dark  → fondo navy profundo  #0D1127  |  card #141929
   Light → fondo blanco/crema   #F5F5F2  |  card #FFFFFF
   Acento (botón) → periwinkle  #8B8FC8
   Primario brand → navy oscuro #0D1127
──────────────────────────────────────────────────────────── */

// ── Colores compartidos ──────────────────────────────────────
const NAVY       = '#0D1127';
const NAVY_MID   = '#141929';
const NAVY_LIGHT = '#1E2A45';
const PERIW      = '#8B8FC8';   // periwinkle – botón LOGIN Futark
const PERIW_DARK = '#6B6FAE';
const SILVER     = '#C8CAD4';
const OFF_WHITE  = '#F5F5F2';

// ────────────────────────────────────────────────────────────
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:         NAVY,
      light:        NAVY_LIGHT,
      dark:         '#060B19',
      contrastText: '#fff',
    },
    secondary: {
      main:         PERIW,
      light:        '#A8ACDC',
      dark:         PERIW_DARK,
      contrastText: '#fff',
    },
    success:  { main: '#2E7D52' },
    warning:  { main: '#B45309' },
    error:    { main: '#C0392B' },
    background: {
      default: OFF_WHITE,
      paper:   '#FFFFFF',
    },
    text: {
      primary:   NAVY,
      secondary: '#5A6478',
    },
    divider: '#E0E0D8',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.08em' },
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitTapHighlightColor: 'transparent',
        },
        body: { backgroundColor: OFF_WHITE },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          WebkitTapHighlightColor: 'transparent',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 16px rgba(13,17,39,0.08)',
          border: '1px solid #E0E0D8',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundColor: '#FFFFFF' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E0E0D8',
          color: NAVY,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: NAVY,
          color: '#fff',
          '&:hover': { background: NAVY_LIGHT },
        },
        containedSecondary: {
          background: PERIW,
          color: '#fff',
          '&:hover': { background: PERIW_DARK },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          WebkitTapHighlightColor: 'transparent',
        },
      },
    },
  },
});

// ────────────────────────────────────────────────────────────
/* Dark = misma marca que light: fondo navy, superficies NAVY_MID, acento periwinkle.
   Primary en oscuro es PERIW (como botón login en claro); texto claro sobre oscuro.
   Success más suave que el mint puro (#34D399) para no competir con el acento morado. */
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main:         PERIW,
      light:        '#A8ACDC',
      dark:         PERIW_DARK,
      contrastText: '#fff',
    },
    secondary: {
      main:         SILVER,
      light:        '#E0E2EC',
      dark:         '#9A9CAC',
      contrastText: NAVY,
    },
    success:  { main: '#7DD3A0' },
    warning:  { main: '#FBBF24' },
    error:    { main: '#F87171' },
    background: {
      default: NAVY,
      paper:   NAVY_MID,
    },
    text: {
      primary:   '#E8E9F0',
      secondary: '#9EA3B8',
    },
    divider: 'rgba(200,202,212,0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.08em' },
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitTapHighlightColor: 'transparent',
        },
        body: { backgroundColor: NAVY },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          WebkitTapHighlightColor: 'transparent',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: NAVY_MID,
          border: '1px solid rgba(200,202,212,0.12)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: NAVY_MID,
          border: '1px solid rgba(200,202,212,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: NAVY,
          borderBottom: '1px solid rgba(200,202,212,0.10)',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: PERIW,
          color: '#fff',
          '&:hover': { background: PERIW_DARK },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: NAVY_MID,
          border: '1px solid rgba(200,202,212,0.12)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: 'rgba(200,202,212,0.10)' },
        head: { backgroundColor: '#0F1830', color: SILVER },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': { borderColor: 'rgba(200,202,212,0.18)' },
          '&:hover fieldset': { borderColor: PERIW },
          '&.Mui-focused fieldset': { borderColor: PERIW },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          WebkitTapHighlightColor: 'transparent',
        },
      },
    },
  },
});
