import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardMedia, CardContent, Typography,
  Box, Chip, CircularProgress, Alert, AppBar, Toolbar, Button, IconButton, Tooltip,
  Avatar, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import SoporteFloating from '../components/SoporteFloating';
import {
  BRAND_NAVY, BRAND_NAVY_TOP, BRAND_PERIW, BRAND_PERIW_HOVER, BRAND_TEXT, BRAND_BORDER, BRAND_SHADOW,
} from '../brandColors';

const R_CARD = '20px';

/** Misma columna centrada que Home (título + grid alineados) */
const sxListingColumn = {
  width: '100%',
  maxWidth: { xs: '100%', md: 1040, lg: 1100, xl: 1160 },
  mx: { xs: 0, md: 'auto' },
  px: { xs: 0, sm: 0, md: 2, lg: 3, xl: 4 },
};

const Landing = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeMode();
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    api.get('/productos')
      .then(r => setProductos(r.data))
      .catch(() => setError("No se pudieron cargar los servicios."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress sx={{ color: BRAND_PERIW }} />
    </Box>
  );

  return (
    <>
      {/* Navbar público */}
      <AppBar position="static" elevation={0} sx={{
        background: isDark
          ? `linear-gradient(90deg, ${BRAND_NAVY}f5 0%, ${BRAND_NAVY_TOP}ee 100%)`
          : 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${BRAND_BORDER}`,
        boxShadow: `0 2px 20px ${BRAND_SHADOW}`,
      }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: '10px',
              background: `linear-gradient(145deg, ${BRAND_NAVY_TOP} 0%, ${BRAND_NAVY} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 16px ${BRAND_SHADOW}`, flexShrink: 0,
              border: `1px solid ${BRAND_BORDER}`,
            }}>
              <Typography sx={{ color: BRAND_PERIW, fontWeight: 900, fontSize: '1rem', lineHeight: 1 }}>Z</Typography>
            </Box>
            <Typography sx={{
              fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.5px',
              color: isDark ? BRAND_TEXT : BRAND_NAVY,
              lineHeight: 1,
            }}>
              Zento
            </Typography>
          </Box>
          <Tooltip title={isDark ? t.lightMode : t.darkMode}>
            <IconButton onClick={toggleTheme} sx={{ color: 'text.secondary', mr: 1 }}>
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Button variant="contained" onClick={() => navigate('/login')}
            sx={{
              fontWeight: 'bold', px: 3, borderRadius: '50px',
              bgcolor: BRAND_PERIW, color: '#fff',
              '&:hover': { bgcolor: BRAND_PERIW_HOVER },
            }}>
            {t.access}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero — misma familia cromática que la zona de formulario del Login */}
      <Box sx={{
        background: `linear-gradient(165deg, ${BRAND_NAVY_TOP} 0%, ${BRAND_NAVY} 45%, #0a0e1f 100%)`,
        color: '#E8E9F0',
        py: { xs: 6, md: 8 },
        textAlign: 'center',
        borderBottom: `1px solid ${BRAND_BORDER}`,
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
            {t.heroTitle}{' '}
            <Box component="span" sx={{
              fontStyle: 'italic',
              color: BRAND_PERIW,
              textShadow: '0 0 40px rgba(139,143,200,0.25)',
            }}>
              {t.heroTitleItalic}
            </Box>
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ color: 'rgba(220,222,232,0.88)', fontWeight: 400 }}
          >
            {t.heroSubtitle}
          </Typography>
          <Box sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}>
            {[
              { Icon: ChatBubbleOutlineIcon, label: t.support24 },
              { Icon: LockOutlinedIcon, label: t.securePay },
            ].map(({ Icon, label }) => (
              <Box
                key={label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2.5,
                  py: 1.25,
                  borderRadius: '999px',
                  backgroundColor: 'rgba(139,143,200,0.16)',
                  border: '1px solid rgba(139,143,200,0.28)',
                }}
              >
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: BRAND_PERIW,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(139,143,200,0.35)',
                }}>
                  <Icon sx={{ fontSize: 22, color: '#0D1127' }} />
                </Box>
                <Typography variant="body1" sx={{ color: '#F8F9FC', fontWeight: 500 }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Categorías — mismo ancho útil que Home */}
      <Container maxWidth="xl" sx={{ mt: 6, mb: 4, px: { xs: 1.5, sm: 3, md: 4 } }}>
        <Box sx={sxListingColumn}>
          <Grid container spacing={2} justifyContent="center">
            {['Programación', 'Diseño Gráfico', 'Marketing', 'Escritura', 'Video', 'Música'].map(cat => (
              <Grid item key={cat}>
                <Chip label={cat} sx={{
                  py: 2.5, px: 2, fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(200,202,212,0.2)' : BRAND_BORDER,
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'transparent',
                  '&:hover': {
                    bgcolor: BRAND_PERIW_HOVER,
                    color: '#fff',
                    borderColor: BRAND_PERIW_HOVER,
                  },
                }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Servicios populares — grid CSS como Home (3 columnas desde md, celdas iguales) */}
      <Container maxWidth="xl" sx={{ mt: 6, mb: 8, px: { xs: 1.5, sm: 3, md: 4 } }}>
        <Box sx={sxListingColumn}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            fontWeight="bold"
            sx={{ mb: 4, color: isDark ? BRAND_PERIW : 'primary.main' }}
          >
            {t.popularServices}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <Box
            sx={{
              display: 'grid',
              width: '100%',
              gap: { xs: 1.5, sm: 2.25, md: 2.5 },
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
                xl: 'repeat(3, minmax(0, 1fr))',
              },
              alignItems: 'stretch',
            }}
          >
            {productos.map(prod => (
              <Card
                key={prod.id}
                onClick={() => navigate('/login')}
                sx={{
                  height: '100%',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: R_CARD,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  ...(isDark && {
                    border: '1px solid rgba(200,202,212,0.12)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  }),
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDark
                      ? '0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,143,200,0.14)'
                      : '0 12px 32px rgba(13,17,39,0.12)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height={isMobile ? 110 : 160}
                  image={prod.urlPortada || prod.urlArchivo || 'https://via.placeholder.com/300?text=Sin+Imagen'}
                  alt={prod.titulo}
                  loading="lazy"
                  sx={{ width: '100%', objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 }, pb: { xs: 0.5, sm: 1 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Avatar
                      sx={{
                        width: { xs: 16, sm: 22 },
                        height: { xs: 16, sm: 22 },
                        fontSize: '0.65rem',
                        bgcolor: BRAND_PERIW,
                        color: '#fff',
                        fontWeight: 700,
                      }}
                      src={prod.vendedor?.fotoUrl}
                    >
                      {prod.vendedor?.nombreMostrado?.charAt(0) || '?'}
                    </Avatar>
                    <Typography variant="caption" fontWeight="bold" noWrap sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                      {prod.vendedor?.nombreMostrado || t.seller}
                    </Typography>
                  </Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{
                      lineHeight: 1.2,
                      height: '2.4em',
                      overflow: 'hidden',
                      fontSize: { xs: '0.72rem', sm: '0.875rem' },
                    }}
                  >
                    {prod.titulo}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <StarBorderIcon sx={{ fontSize: { xs: 14, sm: 18 }, color: `${BRAND_PERIW}99` }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: isDark ? 'rgba(200,202,212,0.82)' : 'text.secondary',
                        fontWeight: 600,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      }}
                    >
                      4.9
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isDark ? 'rgba(200,202,212,0.72)' : 'text.secondary',
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      }}
                    >
                      (156)
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: 'uppercase',
                      color: isDark ? 'rgba(200,202,212,0.75)' : 'text.secondary',
                    }}
                  >
                    {t.from}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: 'success.main' }}>
                    ${prod.precio}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
          {productos.length === 0 && !error && (
            <Alert severity="info" sx={{ mt: 3 }}>{t.noServices}</Alert>
          )}
        </Box>
      </Container>

      {/* Footer CTA */}
      <Box sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 6,
        textAlign: 'center',
        bgcolor: isDark ? '#0a0e1f' : 'background.paper',
        backgroundImage: isDark
          ? `linear-gradient(180deg, rgba(10,14,31,0.98) 0%, ${BRAND_NAVY} 100%)`
          : 'none',
      }}>
        <Container maxWidth="sm">
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: isDark ? BRAND_TEXT : 'text.primary' }}>
            {t.ctaTitle}
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ color: isDark ? 'rgba(200,202,212,0.8)' : 'text.secondary' }}
          >
            {t.ctaSubtitle}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              fontWeight: 'bold',
              px: 5,
              py: 1.5,
              bgcolor: BRAND_PERIW,
              color: '#fff',
              '&:hover': { bgcolor: BRAND_PERIW_HOVER },
            }}
          >
            {t.ctaButton}
          </Button>
        </Container>
      </Box>

      <SoporteFloating />
    </>
  );
};

export default Landing;
