import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Grid, Card, CardMedia, CardContent, Typography,
  CardActions, Button, Chip, Box, CircularProgress, Alert,
  Avatar, TextField, InputAdornment, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import api from '../services/api';
import ProductoModal from '../components/ProductoModal';
import { useThemeMode } from '../ThemeContext';

const TIPOS = [
  { value: '',                   label: 'Todos' },
  { value: 'SERVICIO_GIG',       label: 'Servicio / Gig' },
  { value: 'CURSO_DIGITAL',      label: 'Curso Digital' },
  { value: 'RECURSO_DESCARGABLE',label: 'Descargable' },
  { value: 'SUSCRIPCION',        label: 'Suscripción' },
  { value: 'PRODUCTO_FISICO',    label: 'Producto' },
  { value: 'CONSULTORIA',        label: 'Consultoría' },
  { value: 'DISENO_GRAFICO',     label: 'Diseño Gráfico' },
  { value: 'DESARROLLO_WEB',     label: 'Dev Web' },
  { value: 'MARKETING_DIGITAL',  label: 'Marketing' },
  { value: 'MUSICA_AUDIO',       label: 'Música / Audio' },
];

const Home = () => {
  const [productos, setProductos]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [selected, setSelected]         = useState(null);
  const [busqueda, setBusqueda]         = useState('');
  const [tipoFiltro, setTipoFiltro]     = useState('');
  const { isDark } = useThemeMode();
  const usuarioLogueado = localStorage.getItem('usuarioId');

  const cargar = useCallback(async (q, tipo) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q?.trim())  params.append('q', q.trim());
      if (tipo)       params.append('tipo', tipo);
      const url = `/productos${params.toString() ? '?' + params : ''}`;
      const res = await api.get(url);
      setProductos(res.data);
      setError(null);
    } catch {
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce búsqueda
  useEffect(() => {
    const t = setTimeout(() => cargar(busqueda, tipoFiltro), 350);
    return () => clearTimeout(t);
  }, [busqueda, tipoFiltro, cargar]);

  const handleEliminar = async (e, id) => {
  e.stopPropagation();
  if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
  try {
    await api.delete(`/productos/${id}`);
    setProductos(p => p.filter(x => x.id !== id));
  } catch (error) {
    console.error("Error al eliminar:", error.response?.data || error.message);
    alert('Error al eliminar el producto. Intenta de nuevo.');
  }
};

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
        Explora Servicios Digitales
      </Typography>

      {/* ── Barra de búsqueda ── */}
      <TextField
        fullWidth
        placeholder="Buscar servicios, cursos, recursos..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
          ),
        }}
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />

      {/* ── Chips de categoría ── */}
      <Box sx={{ mb: 3, overflowX: 'auto', pb: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
          {TIPOS.map(t => (
            <Chip
              key={t.value}
              label={t.label}
              clickable
              color={tipoFiltro === t.value ? 'primary' : 'default'}
              variant={tipoFiltro === t.value ? 'filled' : 'outlined'}
              onClick={() => setTipoFiltro(t.value)}
              sx={{ fontWeight: tipoFiltro === t.value ? 'bold' : 'normal', whiteSpace: 'nowrap' }}
            />
          ))}
        </Stack>
      </Box>

      {/* ── Contenido ── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : productos.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Sin resultados</Typography>
          <Typography variant="body2" color="text.secondary">Prueba con otras palabras o categoría</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {productos.map(prod => (
            <Grid item key={prod.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                onClick={() => { setSelected(prod); setModalOpen(true); }}
                sx={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDark ? '0 8px 24px rgba(124,58,237,0.3)' : '0 8px 24px rgba(55,48,163,0.2)',
                  }
                }}
              >
                <CardMedia component="img" height="180"
                  image={prod.urlArchivo || prod.urlPortada || 'https://via.placeholder.com/300?text=Sin+Imagen'}
                  alt={prod.titulo} loading="lazy" sx={{ objectFit: 'cover' }} />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', bgcolor: 'primary.main' }}
                      src={prod.vendedor?.fotoUrl}>
                      {prod.vendedor?.nombreMostrado?.charAt(0) || '?'}
                    </Avatar>
                    <Typography variant="caption" fontWeight="bold">
                      {prod.vendedor?.nombreMostrado || 'Vendedor'}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold"
                    sx={{ lineHeight: 1.2, height: '2.4em', overflow: 'hidden' }}>
                    {prod.titulo}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip label={prod.tipo?.replace(/_/g, ' ')} size="small" color="primary" variant="outlined" />
                    <Typography variant="h6" color="success.main" fontWeight="bold">${prod.precio}</Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                  <Button variant="contained" startIcon={<ShoppingCartIcon />} fullWidth
                    sx={{ borderRadius: 2 }}
                    onClick={e => { e.stopPropagation(); setSelected(prod); setModalOpen(true); }}>
                    Ver y Comprar
                  </Button>
                  {prod.vendedor && String(prod.vendedor.id) === usuarioLogueado && (
                    <Button size="small" color="error"
                      onClick={e => handleEliminar(e, prod.id)}
                      sx={{ minWidth: 45, borderRadius: 2 }}>
                      <DeleteIcon />
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ProductoModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); }}
        producto={selected}
      />
    </Container>
  );
};

export default Home;
