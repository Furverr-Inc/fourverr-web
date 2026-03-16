import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Box, Typography, Avatar, CircularProgress, Alert,
  Chip, Divider, Grid, Card, CardMedia, CardContent, IconButton, Tooltip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon   from '@mui/icons-material/ArrowBack';
import StorefrontIcon  from '@mui/icons-material/Storefront';
import LanguageIcon    from '@mui/icons-material/Language';
import InstagramIcon   from '@mui/icons-material/Instagram';
import TwitterIcon     from '@mui/icons-material/Twitter';
import LinkedInIcon    from '@mui/icons-material/LinkedIn';
import LocationOnIcon  from '@mui/icons-material/LocationOn';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import ProductoModal from '../components/ProductoModal';

const PerfilPublico = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { isDark } = useThemeMode();
  const [perfil,   setPerfil]   = useState(null);
  const [productos,setProductos]= useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [modal,    setModal]    = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [perfilRes, todosRes] = await Promise.all([
          api.get(`/users/perfil/${username}`),
          api.get('/productos'),
        ]);
        setPerfil(perfilRes.data);
        setProductos(todosRes.data.filter(p => p.vendedor?.username === username));
      } catch { setError('No se pudo cargar el perfil.'); }
      finally   { setLoading(false); }
    };
    cargar();
  }, [username]);

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:10 }}><CircularProgress /></Box>;
  if (error)   return <Container sx={{ mt:5 }}><Alert severity="error">{error}</Alert></Container>;
  if (!perfil) return null;

  return (
    <Container maxWidth={false} sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 1, sm: 3 }, maxWidth: { xs: '100%', sm: 'md', md: 'md' } }}>
      {/* Volver */}
      <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ minWidth: 44, minHeight: 44 }}><ArrowBackIcon /></IconButton>
        <Typography variant="body2" color="text.secondary">Volver</Typography>
      </Box>

      {/* Tarjeta de perfil */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius:3, mb:3 }}>
        <Box sx={{ display:'flex', alignItems: { xs: 'center', sm: 'flex-start' }, gap: { xs: 2, sm: 3, md: 4 }, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Avatar src={perfil.fotoUrl}
            sx={{ width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 }, fontSize: { xs: '2rem', sm: '2.5rem' }, bgcolor:'primary.main' }}>
            {!perfil.fotoUrl && (perfil.nombreMostrado?.charAt(0) || perfil.username?.charAt(0) || 'U')}
          </Avatar>
          <Box sx={{ flex:1, minWidth: { xs: '100%', sm: 200 }, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" fontWeight="bold">
              {perfil.nombreMostrado || perfil.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>@{perfil.username}</Typography>

            <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mb:1.5 }}>
              <Chip label={perfil.role}
                color={perfil.role === 'SELLER' ? 'success' : 'default'} size="small"
                icon={perfil.role === 'SELLER' ? <StorefrontIcon /> : undefined} />
              {(perfil.ciudad || perfil.pais) && (
                <Chip icon={<LocationOnIcon />}
                  label={[perfil.ciudad, perfil.pais].filter(Boolean).join(', ')}
                  size="small" variant="outlined" />
              )}
            </Box>

            {perfil.descripcion && (
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight:1.7, mb:2 }}>
                {perfil.descripcion}
              </Typography>
            )}

            {/* Redes sociales */}
            <Box sx={{ display:'flex', gap:0.5, flexWrap:'wrap', alignItems:'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              {perfil.sitioWeb && (
                <Tooltip title={perfil.sitioWeb}>
                  <IconButton size="small" component="a" href={perfil.sitioWeb} target="_blank" rel="noopener" sx={{ minWidth: 44, minHeight: 44 }}>
                    <LanguageIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {perfil.instagram && (
                <Tooltip title={`@${perfil.instagram}`}>
                  <IconButton size="small" component="a"
                    href={`https://instagram.com/${perfil.instagram}`} target="_blank" rel="noopener"
                    sx={{ color:'#E1306C', minWidth: 44, minHeight: 44 }}>
                    <InstagramIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {perfil.twitter && (
                <Tooltip title={`@${perfil.twitter}`}>
                  <IconButton size="small" component="a"
                    href={`https://twitter.com/${perfil.twitter}`} target="_blank" rel="noopener"
                    sx={{ color:'#1DA1F2' }}>
                    <TwitterIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {perfil.linkedin && (
                <Tooltip title="LinkedIn">
                  <IconButton size="small" component="a" href={perfil.linkedin} target="_blank" rel="noopener"
                    sx={{ color:'#0A66C2' }}>
                    <LinkedInIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Publicaciones del vendedor */}
      {perfil.role === 'SELLER' && (
        <>
          <Typography variant="h5" fontWeight="bold" sx={{ mb:2 }}>
            Publicaciones de {perfil.nombreMostrado || perfil.username}
          </Typography>
          {productos.length === 0 ? (
            <Alert severity="info">Este vendedor aún no tiene publicaciones.</Alert>
          ) : (
            <Grid container spacing={2}>
              {productos.map(prod => (
                <Grid item key={prod.id} xs={12} sm={6} md={4}>
                  <Card onClick={() => { setSelected(prod); setModal(true); }}
                    sx={{ borderRadius:3, cursor:'pointer', transition:'transform 0.2s',
                      '&:hover': { transform:'translateY(-3px)',
                        boxShadow: isDark ? '0 8px 24px rgba(124,58,237,0.3)' : '0 8px 24px rgba(55,48,163,0.15)' }
                    }}>
                    <CardMedia component="img" height="160"
                      image={prod.urlArchivo || prod.urlPortada || 'https://via.placeholder.com/300'}
                      sx={{ objectFit:'cover' }} />
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>{prod.titulo}</Typography>
                      <Box sx={{ display:'flex', justifyContent:'space-between', mt:1 }}>
                        <Chip label={prod.tipo?.replace(/_/g,' ')} size="small" color="primary" variant="outlined" />
                        <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                          ${prod.precio}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <ProductoModal
        open={modal}
        onClose={() => { setModal(false); setSelected(null); }}
        producto={selected}
      />
    </Container>
  );
};

export default PerfilPublico;
