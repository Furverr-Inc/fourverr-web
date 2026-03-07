import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Grid, Card, CardMedia, CardContent, Typography,
  CardActions, Button, Chip, Box, CircularProgress, Alert,
  Avatar, TextField, InputAdornment, Stack, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import api from '../services/api';
import ProductoModal from '../components/ProductoModal';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

const TIPOS = (t) => [
  { value: '',                    label: t.categories.all },
  { value: 'SERVICIO_GIG',        label: t.categories.gig },
  { value: 'CURSO_DIGITAL',       label: t.categories.course },
  { value: 'RECURSO_DESCARGABLE', label: t.categories.download },
  { value: 'SUSCRIPCION',         label: t.categories.subscription },
  { value: 'PRODUCTO_FISICO',     label: t.categories.product },
  { value: 'CONSULTORIA',         label: t.categories.consulting },
  { value: 'DISENO_GRAFICO',      label: t.categories.design },
  { value: 'DESARROLLO_WEB',      label: t.categories.webDev },
  { value: 'MARKETING_DIGITAL',   label: t.categories.marketing },
  { value: 'MUSICA_AUDIO',        label: t.categories.music },
];

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const { isDark } = useThemeMode();
  const { t } = useLanguage();
  const usuarioLogueado = localStorage.getItem('usuarioId');

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  const cargar = useCallback(async (q, tipo) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q?.trim()) params.append('q', q.trim());
      if (tipo) params.append('tipo', tipo);
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

  useEffect(() => {
    const timer = setTimeout(() => cargar(busqueda, tipoFiltro), 350);
    return () => clearTimeout(timer);
  }, [busqueda, tipoFiltro, cargar]);

  const handleEliminarClick = (e, prod) => {
    e.stopPropagation();
    setProductoAEliminar(prod);
    setConfirmOpen(true);
  };

  const handleConfirmEliminar = async () => {
    try {
      await api.delete(`/productos/${productoAEliminar.id}`);
      setProductos(p => p.filter(x => x.id !== productoAEliminar.id));
      showSnack('Producto eliminado correctamente');
    } catch {
      showSnack('Error al eliminar el producto', 'error');
    } finally {
      setConfirmOpen(false);
      setProductoAEliminar(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
        {t.exploreServices}
      </Typography>

      <TextField
        fullWidth
        placeholder={t.searchPlaceholder}
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
          ),
        }}
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />

      <Box sx={{ mb: 3, overflowX: 'auto', pb: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
          {TIPOS(t).map(tipo => (
            <Chip
              key={tipo.value}
              label={tipo.label}
              clickable
              color={tipoFiltro === tipo.value ? 'primary' : 'default'}
              variant={tipoFiltro === tipo.value ? 'filled' : 'outlined'}
              onClick={() => setTipoFiltro(tipo.value)}
              sx={{ fontWeight: tipoFiltro === tipo.value ? 'bold' : 'normal', whiteSpace: 'nowrap' }}
            />
          ))}
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : productos.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">{t.noResults}</Typography>
          <Typography variant="body2" color="text.secondary">{t.noResultsHint}</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {productos.map(prod => (
            <Grid item key={prod.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                onClick={() => { setSelected(prod); setModalOpen(true); }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(124,58,237,0.3)'
                      : '0 8px 24px rgba(55,48,163,0.2)',
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={prod.urlArchivo || prod.urlPortada || 'https://via.placeholder.com/300?text=Sin+Imagen'}
                  alt={prod.titulo}
                  loading="lazy"
                  sx={{ objectFit: 'cover' }}
                />

                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar
                      sx={{ width: 24, height: 24, fontSize: '0.8rem', bgcolor: 'primary.main' }}
                      src={prod.vendedor?.fotoUrl}
                    >
                      {prod.vendedor?.nombreMostrado?.charAt(0) || '?'}
                    </Avatar>
                    <Typography variant="caption" fontWeight="bold">
                      {prod.vendedor?.nombreMostrado || t.seller}
                    </Typography>
                  </Box>

                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ lineHeight: 1.2, height: '2.4em', overflow: 'hidden' }}
                  >
                    {prod.titulo}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip
                      label={prod.tipo?.replace(/_/g, ' ')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      ${prod.precio}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                    onClick={e => { e.stopPropagation(); setSelected(prod); setModalOpen(true); }}
                  >
                    {t.buyAndView}
                  </Button>

                  {prod.vendedor && String(prod.vendedor.id) === usuarioLogueado && (
                    <Button
                      size="small"
                      color="error"
                      onClick={e => handleEliminarClick(e, prod)}
                      sx={{ minWidth: 45, borderRadius: 2 }}
                    >
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

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight="bold">⚠️ ¿Eliminar producto?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar{" "}
            <strong>"{productoAEliminar?.titulo}"</strong>?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => { setConfirmOpen(false); setProductoAEliminar(null); }}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmEliminar}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Home;