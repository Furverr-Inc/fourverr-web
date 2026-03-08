import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Grid, Card, CardMedia, CardContent, Typography,
  CardActions, Button, Chip, Box, CircularProgress, Alert,
  Avatar, TextField, InputAdornment, Stack, Rating
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../services/api';
import ProductoModal from '../components/ProductoModal';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

const PAGE_SIZE = 12;

const Home = () => {
  const [productos, setProductos]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [selected, setSelected]     = useState(null);
  const [busqueda, setBusqueda]     = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [visibles, setVisibles]     = useState(PAGE_SIZE);
  const { isDark } = useThemeMode();
  const { t } = useLanguage();
  const usuarioLogueado = localStorage.getItem('usuarioId');

  // Ratings por producto (cargados lazy)
  const [ratings, setRatings] = useState({}); // { [productoId]: { promedio, total } }

  const TIPOS = [
    { value: '', label: t.categories.all },
    { value: 'SERVICIO_GIG', label: t.categories.gig },
    { value: 'CURSO_DIGITAL', label: t.categories.course },
    { value: 'RECURSO_DESCARGABLE', label: t.categories.download },
    { value: 'SUSCRIPCION', label: t.categories.subscription },
    { value: 'PRODUCTO_FISICO', label: t.categories.product },
    { value: 'CONSULTORIA', label: t.categories.consulting },
    { value: 'DISENO_GRAFICO', label: t.categories.design },
    { value: 'DESARROLLO_WEB', label: t.categories.webDev },
    { value: 'MARKETING_DIGITAL', label: t.categories.marketing },
    { value: 'MUSICA_AUDIO', label: t.categories.music },
  ];

  const cargar = useCallback(async (q, tipo) => {
    setLoading(true);
    setVisibles(PAGE_SIZE);
    try {
      const params = new URLSearchParams();
      if (q?.trim()) params.append('q', q.trim());
      if (tipo)      params.append('tipo', tipo);
      const res = await api.get(`/productos${params.toString() ? '?' + params : ''}`);
      setProductos(res.data);
      setError(null);
      // Cargar ratings de los primeros productos
      cargarRatings(res.data.slice(0, PAGE_SIZE));
    } catch { setError('No se pudieron cargar los productos.'); }
    finally { setLoading(false); }
  }, []);

  const cargarRatings = async (prods) => {
    const nuevos = {};
    await Promise.allSettled(prods.map(async (p) => {
      if (!ratings[p.id]) {
        try {
          const r = await api.get(`/resenas/producto/${p.id}`);
          if (r.data.total > 0) nuevos[p.id] = { promedio: r.data.promedio, total: r.data.total };
        } catch {}
      }
    }));
    if (Object.keys(nuevos).length > 0)
      setRatings(prev => ({ ...prev, ...nuevos }));
  };

  useEffect(() => {
    const timer = setTimeout(() => cargar(busqueda, tipoFiltro), 350);
    return () => clearTimeout(timer);
  }, [busqueda, tipoFiltro, cargar]);

  // Cargar ratings de nuevos productos al paginar
  const handleVerMas = () => {
    const nuevoVisibles = visibles + PAGE_SIZE;
    setVisibles(nuevoVisibles);
    cargarRatings(productos.slice(visibles, nuevoVisibles));
  };

  const handleEliminar = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
    try { await api.delete(`/productos/${id}`); setProductos(p => p.filter(x => x.id !== id)); }
    catch { alert('Error al eliminar.'); }
  };

  const productosMostrados = productos.slice(0, visibles);
  const hayMas = visibles < productos.length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
        {t.exploreServices}
      </Typography>

      <TextField fullWidth placeholder={t.searchPlaceholder}
        value={busqueda} onChange={e => setBusqueda(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>, sx: { borderRadius: 3 } }}
        sx={{ mb: 3 }}
      />

      <Stack direction="row" spacing={1} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
        {TIPOS.map(tp => (
          <Chip key={tp.value} label={tp.label}
            onClick={() => setTipoFiltro(tp.value)}
            color={tipoFiltro === tp.value ? 'primary' : 'default'}
            variant={tipoFiltro === tp.value ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer', flexShrink: 0 }}
          />
        ))}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : productos.length === 0 ? (
        <Alert severity="info">{t.noResults} — {t.noResultsHint}</Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t.showing} {productosMostrados.length} {t.of} {productos.length} {t.products}
          </Typography>

          <Grid container spacing={3}>
            {productosMostrados.map(prod => {
              const rating = ratings[prod.id];
              return (
                <Grid item key={prod.id} xs={12} sm={6} md={4} lg={3}>
                  <Card sx={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    borderRadius: 3, cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDark ? '0 8px 30px rgba(99,102,241,0.25)' : '0 8px 30px rgba(99,102,241,0.15)',
                    }
                  }} onClick={() => { setSelected(prod); setModalOpen(true); }}>
                    <CardMedia component="img" height="160"
                      image={prod.urlPortada || prod.urlArchivo || 'https://via.placeholder.com/300?text=Sin+Imagen'}
                      alt={prod.titulo} loading="lazy" sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar sx={{ width: 22, height: 22, fontSize: '0.75rem', bgcolor: 'primary.main' }} src={prod.vendedor?.fotoUrl}>
                          {prod.vendedor?.nombreMostrado?.charAt(0) || '?'}
                        </Avatar>
                        <Typography variant="caption" fontWeight="bold" noWrap>
                          {prod.vendedor?.nombreMostrado || 'Vendedor'}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2, height: '2.4em', overflow: 'hidden' }}>
                        {prod.titulo}
                      </Typography>
                      {/* Rating inline si existe */}
                      {rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Rating value={rating.promedio} precision={0.1} size="small" readOnly sx={{ fontSize: '0.9rem' }} />
                          <Typography variant="caption" color="text.secondary">
                            {rating.promedio.toFixed(1)} ({rating.total})
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                        <Chip label={prod.tipo?.replace(/_/g, ' ')} size="small" color="primary" variant="outlined" />
                        <Typography variant="h6" color="success.main" fontWeight="bold">${prod.precio}</Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                      <Button variant="contained" startIcon={<ShoppingCartIcon />} fullWidth sx={{ borderRadius: 2 }}
                        onClick={e => { e.stopPropagation(); setSelected(prod); setModalOpen(true); }}>
                        {t.buyAndView}
                      </Button>
                      {prod.vendedor && String(prod.vendedor.id) === usuarioLogueado && (
                        <Button size="small" color="error" onClick={e => handleEliminar(e, prod.id)} sx={{ minWidth: 42, borderRadius: 2 }}>
                          <DeleteIcon />
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {hayMas && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {productos.length - visibles} {t.products} más
              </Typography>
              <Button variant="outlined" size="large" endIcon={<ExpandMoreIcon />}
                onClick={handleVerMas} sx={{ borderRadius: 3, px: 4 }}>
                {t.loadMore}
              </Button>
            </Box>
          )}
        </>
      )}

      <ProductoModal open={modalOpen} onClose={() => { setModalOpen(false); setSelected(null); }} producto={selected} />
    </Container>
  );
};

export default Home;
