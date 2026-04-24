import { createTheme } from '@mui/material/styles';

/* ────────────────────────────────────────────────────────────
   PALETA FUTARK / ZENTO
   Dark  → fondo navy profundo  #0D1127  |  card #141929
   Light → fondo blanco/crema   #F5F5F2  |  card #FFFFFF
   Acento (botón) → periwinkle  #8B8FC8
   Primario brand → navy oscuro #0D1127
──────────────────────────────────────────────────────────── */

// ── Colores compartidos ──────────────────────────────────────
const NAVY       = '#0D1127';
const NAVY_MID   = '#141929';
const NAVY_LIGHT = '#1E2A45';
const PERIW      = '#8B8FC8';
const PERIW_DARK = '#6B6FAE';
const SILVER     = '#C8CAD4';
const OFF_WHITE  = '#F5F5F2';

// ── Tokens de movimiento ─────────────────────────────────────
export const MOTION = {
  duration: { quick: 120, base: 200, slow: 320 },
  easing:   { standard: 'cubic-bezier(.2,.8,.2,1)', emphasized: 'cubic-bezier(.2,.8,.2,1.2)' },
};

// ── Anatomía compartida ──────────────────────────────────────
const INPUT_RADIUS  = 12;
const BUTTON_RADIUS = 9999; // pill CTA
const CARD_RADIUS   = 20;

const sharedTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontFeatureSettings: '"cv11", "tnum", "ss01"',
  button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.08em' },
  h1: { fontWeight: 800, letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, letterSpacing: '-0.015em' },
  h3: { fontWeight: 700, letterSpacing: '-0.01em' },
  caption: { letterSpacing: '0.04em' },
};

const motionTransitions = {
  duration: {
    shortest: MOTION.duration.quick,
    shorter:  MOTION.duration.quick,
    short:    MOTION.duration.base,
    standard: MOTION.duration.base,
    complex:  MOTION.duration.slow,
  },
  easing: {
    easeInOut: MOTION.easing.standard,
    easeOut:   MOTION.easing.standard,
    easeIn:    MOTION.easing.standard,
    sharp:     MOTION.easing.emphasized,
  },
};

// ── CssBaseline compartido: focus-visible, reduced-motion ────
const baseCssOverrides = (bgColor) => ({
  html: { WebkitTapHighlightColor: 'transparent' },
  body: { backgroundColor: bgColor },
  '*:focus': { outline: 'none' },
  '*:focus-visible': {
    outline: `2px solid ${PERIW}`,
    outlineOffset: '2px',
    borderRadius: '4px',
  },
  '@keyframes zento-pop': {
    '0%':   { transform: 'scale(1)' },
    '50%':  { transform: 'scale(1.25)' },
    '100%': { transform: 'scale(1)' },
  },
  '@keyframes zento-fade-in': {
    from: { opacity: 0, transform: 'translateY(4px)' },
    to:   { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes zento-pulse-soft': {
    '0%,100%': { boxShadow: '0 6px 20px rgba(139,143,200,0.35)' },
    '50%':     { boxShadow: '0 10px 28px rgba(139,143,200,0.55)' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '*, *::before, *::after': {
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
      transitionDuration: '0.01ms !important',
      scrollBehavior: 'auto !important',
    },
  },
});

// ── Overrides de botón compartidos ───────────────────────────
const buttonOverrides = (mode) => ({
  defaultProps: { disableElevation: true },
  styleOverrides: {
    root: {
      borderRadius: BUTTON_RADIUS,
      paddingInline: 22,
      paddingBlock: 10,
      transition: `background-color ${MOTION.duration.base}ms ${MOTION.easing.standard}, transform ${MOTION.duration.quick}ms ${MOTION.easing.standard}, box-shadow ${MOTION.duration.base}ms ${MOTION.easing.standard}, color ${MOTION.duration.base}ms ${MOTION.easing.standard}`,
      willChange: 'transform',
      '&:active': { transform: 'translateY(1px)' },
      '&.Mui-disabled': { opacity: 0.55 },
    },
    sizeSmall: { paddingInline: 14, paddingBlock: 6 },
    sizeLarge: { paddingInline: 26, paddingBlock: 13, fontSize: '0.95rem' },
    containedPrimary: mode === 'light'
      ? {
          background: NAVY,
          color: '#fff',
          boxShadow: '0 4px 14px rgba(13,17,39,0.18)',
          '&:hover':  { background: NAVY_LIGHT, boxShadow: '0 6px 20px rgba(13,17,39,0.25)' },
          '&:active': { background: NAVY_LIGHT, boxShadow: '0 2px 8px rgba(13,17,39,0.2)' },
        }
      : {
          background: PERIW,
          color: '#fff',
          boxShadow: '0 4px 14px rgba(139,143,200,0.28)',
          '&:hover':  { background: PERIW_DARK, boxShadow: '0 6px 20px rgba(139,143,200,0.4)' },
          '&:active': { background: PERIW_DARK, boxShadow: '0 2px 8px rgba(139,143,200,0.3)' },
        },
    containedSecondary: {
      background: PERIW,
      color: '#fff',
      '&:hover':  { background: PERIW_DARK },
    },
    outlined: {
      borderWidth: 1.5,
      '&:hover': { borderWidth: 1.5 },
    },
    text: {
      '&:hover': { background: mode === 'light' ? 'rgba(13,17,39,0.06)' : 'rgba(232,233,240,0.08)' },
    },
  },
});

// ── Overrides de input compartidos ───────────────────────────
const inputOverrides = (mode) => ({
  MuiTextField: {
    defaultProps: { size: 'medium' },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: INPUT_RADIUS,
        transition: `border-color ${MOTION.duration.base}ms ${MOTION.easing.standard}, box-shadow ${MOTION.duration.base}ms ${MOTION.easing.standard}`,
        backgroundColor: mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.03)',
        '& fieldset': {
          borderColor: mode === 'light' ? 'rgba(13,17,39,0.18)' : 'rgba(200,202,212,0.18)',
          transition: `border-color ${MOTION.duration.base}ms ${MOTION.easing.standard}`,
        },
        '&:hover fieldset':        { borderColor: PERIW },
        '&.Mui-focused fieldset':  { borderColor: PERIW, borderWidth: 2 },
        '&.Mui-focused':           { boxShadow: `0 0 0 4px rgba(139,143,200,0.12)` },
        '&.Mui-error fieldset':    { borderColor: mode === 'light' ? '#C0392B' : '#F87171' },
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        minHeight: 20,
        marginTop: 4,
        transition: `opacity ${MOTION.duration.base}ms ${MOTION.easing.standard}, transform ${MOTION.duration.base}ms ${MOTION.easing.standard}`,
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        '&.Mui-focused': { color: PERIW },
      },
    },
  },
});

// ────────────────────────────────────────────────────────────
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary:   { main: NAVY,  light: NAVY_LIGHT, dark: '#060B19', contrastText: '#fff' },
    secondary: { main: PERIW, light: '#A8ACDC',  dark: PERIW_DARK, contrastText: '#fff' },
    success:   { main: '#2E7D52' },
    warning:   { main: '#B45309' },
    error:     { main: '#C0392B' },
    background:{ default: OFF_WHITE, paper: '#FFFFFF' },
    text:      { primary: NAVY, secondary: '#5A6478' },
    divider:   '#E0E0D8',
  },
  typography: sharedTypography,
  shape: { borderRadius: 10 },
  transitions: motionTransitions,
  components: {
    MuiCssBaseline: { styleOverrides: baseCssOverrides(OFF_WHITE) },
    MuiButtonBase:  { styleOverrides: { root: { WebkitTapHighlightColor: 'transparent' } } },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: CARD_RADIUS,
          boxShadow: '0 2px 16px rgba(13,17,39,0.08)',
          border: '1px solid #E0E0D8',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundColor: '#FFFFFF' } },
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
    MuiButton: buttonOverrides('light'),
    ...inputOverrides('light'),
    MuiChip: {
      styleOverrides: {
        root: {
          WebkitTapHighlightColor: 'transparent',
          transition: `background-color ${MOTION.duration.base}ms ${MOTION.easing.standard}, border-color ${MOTION.duration.base}ms ${MOTION.easing.standard}, color ${MOTION.duration.base}ms ${MOTION.easing.standard}`,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          transition: `transform ${MOTION.duration.base}ms ${MOTION.easing.emphasized}`,
        },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#E0E0D8' } },
    },
  },
});

// ────────────────────────────────────────────────────────────
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: PERIW, light: '#A8ACDC', dark: PERIW_DARK, contrastText: '#fff' },
    secondary: { main: SILVER, light: '#E0E2EC', dark: '#9A9CAC', contrastText: NAVY },
    success:   { main: '#7DD3A0' },
    warning:   { main: '#FBBF24' },
    error:     { main: '#F87171' },
    background:{ default: NAVY, paper: NAVY_MID },
    text:      { primary: '#E8E9F0', secondary: '#9EA3B8' },
    divider:   'rgba(200,202,212,0.12)',
  },
  typography: sharedTypography,
  shape: { borderRadius: 10 },
  transitions: motionTransitions,
  components: {
    MuiCssBaseline: { styleOverrides: baseCssOverrides(NAVY) },
    MuiButtonBase:  { styleOverrides: { root: { WebkitTapHighlightColor: 'transparent' } } },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: CARD_RADIUS,
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
    MuiButton: buttonOverrides('dark'),
    ...inputOverrides('dark'),
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
    MuiChip: {
      styleOverrides: {
        root: {
          WebkitTapHighlightColor: 'transparent',
          transition: `background-color ${MOTION.duration.base}ms ${MOTION.easing.standard}, border-color ${MOTION.duration.base}ms ${MOTION.easing.standard}, color ${MOTION.duration.base}ms ${MOTION.easing.standard}`,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          transition: `transform ${MOTION.duration.base}ms ${MOTION.easing.emphasized}`,
        },
      },
    },
  },
});
