import { useState } from 'react';
import { Box, Tooltip, Collapse, Paper, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useLanguage } from '../LanguageContext';
import { useThemeMode } from '../ThemeContext';
import { BRAND_NAVY, BRAND_NAVY_TOP, BRAND_PERIW, BRAND_BORDER, BRAND_SHADOW } from '../brandColors';

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇲🇽' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

const LanguageSwitcher = () => {
  const { lang, switchLanguage } = useLanguage();
  const { isDark } = useThemeMode();
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 24,
      left: 24,
      zIndex: 1300,
      display: 'flex',
      flexDirection: 'column-reverse',
      alignItems: 'flex-start',
      gap: 1,
    }}>
      {/* Opciones de idioma — aparecen hacia arriba */}
      <Collapse in={open} orientation="vertical">
        <Paper elevation={8} sx={{
          mb: 1,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          background: isDark ? 'rgba(20,20,35,0.97)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(16px)',
        }}>
          {LANGUAGES.map((language, index) => (
            <Box
              key={language.code}
              onClick={() => { switchLanguage(language.code); setOpen(false); }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.2,
                cursor: 'pointer',
                borderBottom: index < LANGUAGES.length - 1 ? '1px solid' : 'none',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                background: lang === language.code
                  ? 'rgba(139,143,200,0.18)'
                  : 'transparent',
                transition: 'background 0.15s',
                '&:hover': {
                  background: 'rgba(139,143,200,0.1)',
                },
              }}
            >
              <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>{language.flag}</Typography>
              <Typography variant="body2" fontWeight={lang === language.code ? 700 : 400}
                sx={{ color: lang === language.code ? BRAND_NAVY : 'text.primary' }}>
                {language.label}
              </Typography>
              {/* Punto verde en el idioma activo */}
              {lang === language.code && (
                <Box sx={{
                  ml: 'auto', width: 7, height: 7, borderRadius: '50%',
                  bgcolor: BRAND_PERIW, flexShrink: 0,
                }} />
              )}
            </Box>
          ))}
        </Paper>
      </Collapse>

      {/* Botón globo */}
      <Tooltip title={open ? '' : 'Cambiar idioma'} placement="right">
        <Box
          onClick={() => setOpen(prev => !prev)}
          sx={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: open
              ? `linear-gradient(145deg, ${BRAND_NAVY_TOP} 0%, ${BRAND_NAVY} 100%)`
              : (isDark ? 'rgba(30,30,50,0.95)' : 'rgba(255,255,255,0.95)'),
            border: '1px solid',
            borderColor: open ? BRAND_BORDER : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'),
            boxShadow: open
              ? `0 4px 22px ${BRAND_SHADOW}`
              : '0 2px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: `0 4px 20px ${BRAND_SHADOW}`,
              transform: 'scale(1.08)',
            },
          }}
        >
          <LanguageIcon sx={{
            fontSize: 22,
            color: open ? BRAND_PERIW : (isDark ? 'rgba(255,255,255,0.7)' : `${BRAND_NAVY}99`),
            transition: 'color 0.2s',
          }} />
        </Box>
      </Tooltip>
    </Box>
  );
};

export default LanguageSwitcher;