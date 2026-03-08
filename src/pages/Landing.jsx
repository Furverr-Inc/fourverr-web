import React, { useEffect, useState } from 'react';
import { 
  Container, Grid, Card, CardMedia, CardContent, Typography, 
  Box, Chip, CircularProgress, Alert, AppBar, Toolbar, Button, IconButton, Tooltip
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import ContactoWidget from '../components/ContactoWidget';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Landing = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeMode();
  const { t } = useLanguage();

  useEffect(() => {
    api.get('/productos')
      .then(r => setProductos(r.data))
      .catch(() => setError("No se pudieron cargar los servicios."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <>
      {/* Navbar público */}
      <AppBar position="static" elevation={0} sx={{
        background: isDark
          ? 'linear-gradient(90deg, rgba(10,10,20,0.97) 0%, rgba(20,10,40,0.97) 100%)'
          : 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.12)',
        boxShadow: isDark ? '0 2px 20px rgba(99,102,241,0.15)' : '0 2px 20px rgba(99,102,241,0.08)',
      }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.5)', flexShrink: 0,
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1rem', lineHeight: 1 }}>Z</Typography>
            </Box>
            <Typography sx={{
              fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.5px',
              background: isDark ? 'linear-gradient(90deg, #a5b4fc, #c4b5fd)' : 'linear-gradient(90deg, #4f46e5, #7c3aed)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1,
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
            sx={{ fontWeight: 'bold', px: 3 }}>
            {t.access}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Box sx={{
        background: isDark
          ? 'linear-gradient(135deg, #0d0d1a 0%, #1e0a3c 50%, #0c4a6e 100%)'
          : 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)',
        color: 'white', py: 8, textAlign: 'center',
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
            {t.heroTitle}{' '}
            <Box component="span" sx={{
              fontStyle: 'italic',
              background: isDark
                ? 'linear-gradient(90deg, #a78bfa, #06b6d4)'
                : 'linear-gradient(90deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {t.heroTitleItalic}
            </Box>
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#cbd5e1' }}>
            {t.heroSubtitle}
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 4 }}>
            {[
              { icon: '💬', label: t.support24 },
              { icon: '🔒', label: t.securePay },
            ].map(item => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: isDark ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : 'linear-gradient(135deg, #3730a3, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.icon}
                </Box>
                <Typography variant="body1" sx={{ color: '#e2e8f0' }}>{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Categorías */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 4 }}>
        <Grid container spacing={2} justifyContent="center">
          {['Programación', 'Diseño Gráfico', 'Marketing', 'Escritura', 'Video', 'Música'].map(cat => (
            <Grid item key={cat}>
              <Chip label={cat} sx={{
                py: 2.5, px: 2, fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
                color: 'text.primary', border: '1px solid', borderColor: 'divider',
                '&:hover': {
                  background: isDark ? 'linear-gradient(90deg, #7c3aed, #06b6d4)' : 'linear-gradient(90deg, #3730a3, #6366f1)',
                  color: 'white', borderColor: 'transparent',
                }
              }} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Servicios populares */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
          {t.popularServices}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        <Grid container spacing={4}>
          {productos.map(prod => (
            <Grid item key={prod.id} xs={12} sm={6} md={4} lg={3}>
              <Card onClick={() => navigate('/login')} sx={{
                height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: isDark ? '0 8px 30px rgba(124,58,237,0.3)' : '0 8px 30px rgba(55,48,163,0.2)',
                }
              }}>
                <CardMedia component="img" height="180"
                  image={prod.urlArchivo || prod.urlPortada || 'https://via.placeholder.com/300?text=Sin+Imagen'}
                  alt={prod.titulo} />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Box sx={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: isDark ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : 'linear-gradient(135deg, #3730a3, #6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '0.75rem', fontWeight: 'bold',
                    }}>
                      {prod.vendedor?.nombreMostrado?.charAt(0) || '?'}
                    </Box>
                    <Typography variant="body2" fontWeight="500">
                      {prod.vendedor?.nombreMostrado || t.seller}
                    </Typography>
                  </Box>
                  <Typography variant="body1" gutterBottom sx={{
                    fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '48px',
                  }}>
                    {prod.titulo}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 'bold' }}>⭐ 4.9</Typography>
                    <Typography variant="caption" color="text.secondary">(156)</Typography>
                  </Box>
                </CardContent>
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    {t.from}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: 'success.main' }}>${prod.precio}</Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        {productos.length === 0 && !error && (
          <Alert severity="info" sx={{ mt: 3 }}>{t.noServices}</Alert>
        )}
      </Container>

      {/* Footer CTA */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Container maxWidth="sm">
          <Typography variant="h4" gutterBottom fontWeight="bold">{t.ctaTitle}</Typography>
          <Typography variant="body1" color="text.secondary" paragraph>{t.ctaSubtitle}</Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/login')}
            sx={{ fontWeight: 'bold', px: 5, py: 1.5 }}>
            {t.ctaButton}
          </Button>
        </Container>
      </Box>

      <LanguageSwitcher />
      <ContactoWidget />
    </>
  );
};

export default Landing;
