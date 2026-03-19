import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Grid, Card, CardMedia, CardContent, Typography,
  CardActions, Button, Chip, Box, CircularProgress, Alert,
  Avatar, TextField, InputAdornment, Stack, Rating,
  Menu, MenuItem, IconButton, Divider, useMediaQuery, Drawer, List, ListItem, ListItemText,
  Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  const [anchorEl, setAnchorEl]     = useState(null); // Para el menú de filtros en móvil
  const [orden, setOrden]           = useState('');   // Para ordenamiento

  const { isDark } = useThemeMode();
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const usuarioLogueado = localStorage.getItem('usuarioId');

  // Ratings por producto (cargados lazy)
  const [ratings, setRatings] = useState({});
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [confirmDlg, setConfirmDlg] = useState({ open: false, id: null });

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

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

      // Aplicar ordenamiento si está activo
      let data = res.data;
      if (orden === 'newest') data = [...data].sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
      if (orden === 'oldest') data = [...data].sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));

      setProductos(data);
      setError(null);
      cargarRatings(data.slice(0, PAGE_SIZE));
    } catch { setError('No se pudieron cargar los productos.'); }
    finally { setLoading(false); }
  }, [orden]);

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

  // Ordenar productos por rating cuando cambia el orden
  const productosOrdenados = React.useMemo(() => {
    if (orden === 'top') {
      return [...productos].sort((a, b) => (ratings[b.id]?.promedio || 0) - (ratings[a.id]?.promedio || 0));
    }
    if (orden === 'low') {
      return [...productos].sort((a, b) => (ratings[a.id]?.promedio || 0) - (ratings[b.id]?.promedio || 0));
    }
    return productos;
  }, [productos, orden, ratings]);

  const handleVerMas = () => {
    const nuevoVisibles = visibles + PAGE_SIZE;
    setVisibles(nuevoVisibles);
    cargarRatings(productosOrdenados.slice(visibles, nuevoVisibles));
  };

  const handleEliminar = async (e, id) => {
    e.stopPropagation();
    setConfirmDlg({ open: true, id });
  };

  const handleConfirmEliminar = async () => {
    const id = confirmDlg.id;
    setConfirmDlg({ open: false, id: null });
    try { await api.delete(`/productos/${id}`); setProductos(p => p.filter(x => x.id !== id)); }
    catch { showSnack('Error al eliminar el producto.', 'error'); }
  };

  const productosMostrados = productosOrdenados.slice(0, visibles);
  const hayMas = visibles < productosOrdenados.length;

  // Label del filtro activo para mostrar en móvil
  const tipoLabel = TIPOS.find(t => t.value === tipoFiltro)?.label || '';
  const ordenLabel = orden === 'top' ? 'Top rated ⭐' : orden === 'low' ? 'Low rated ⭐' : orden === 'newest' ? 'Newest' : orden === 'oldest' ? 'Oldest' : '';

  return (
    <Container maxWidth={false} sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 1, sm: 3 }, maxWidth: { xs: '100%', sm: 'lg', md: 'lg', lg: 'lg' } }}>

      {/* Título — más pequeño en móvil */}
      <Typography
        variant="h4"
        fontWeight="bold"
        color="primary"
        sx={{ mb: 2, fontSize: { xs: '1.4rem', sm: '2rem' } }}
      >
        {t.exploreServices}
      </Typography>

      {/* Barra de búsqueda */}
      <TextField
        fullWidth
        placeholder={t.searchPlaceholder}
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        size={isMobile ? 'small' : 'medium'}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" fontSize={isMobile ? 'small' : 'medium'} />
            </InputAdornment>
          ),
          sx: { borderRadius: 3 }
        }}
        sx={{ mb: 2 }}
      />

      {/* ─── FILTROS ─── */}
      {isMobile ? (
        /* Móvil: botón "filters" + ícono de tres puntos */
        <>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            px: 0.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                filters
              </Typography>
              {/* Chips de filtro activo */}
              {tipoLabel && (
                <Chip
                  label={tipoLabel}
                  size="small"
                  color="primary"
                  onDelete={() => setTipoFiltro('')}
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              )}
              {ordenLabel && (
                <Chip
                  label={ordenLabel}
                  size="small"
                  color="secondary"
                  onDelete={() => setOrden('')}
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              )}
            </Box>
            <IconButton
              size="small"
              onClick={e => setAnchorEl(e.currentTarget)}
              sx={{
                bgcolor: anchorEl ? 'primary.main' : 'action.hover',
                color: anchorEl ? 'white' : 'text.primary',
                borderRadius: 2,
                '&:hover': { bgcolor: 'primary.main', color: 'white' }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Mobile: Bottom Sheet for filters */}
          <Drawer
            anchor="bottom"
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                maxHeight: '70vh',
                pb: 2
              }
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="bold">Filters</Typography>
            </Box>
            <List sx={{ py: 0 }}>
              {/* Sección categorías */}
              <ListItem disabled sx={{ opacity: 1, py: 0 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, px: 2 }}>
                  categories
                </Typography>
              </ListItem>
              {TIPOS.map(tp => (
                <ListItem
                  key={tp.value}
                  button
                  selected={tipoFiltro === tp.value}
                  onClick={() => { setTipoFiltro(tp.value); setAnchorEl(null); }}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    minHeight: 44,
                    '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }
                  }}
                >
                  <ListItemText primary={tp.label} />
                </ListItem>
              ))}

              <ListItem disabled sx={{ opacity: 1, py: 0, mt: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, px: 2 }}>
                  sort by
                </Typography>
              </ListItem>
              {[
                { value: 'top', label: 'Top rated 🌟' },
                { value: 'low', label: 'Low rated ⭐' },
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
              ].map(op => (
                <ListItem
                  key={op.value}
                  button
                  selected={orden === op.value}
                  onClick={() => { setOrden(op.value); setAnchorEl(null); }}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    minHeight: 44,
                    '&.Mui-selected': { bgcolor: 'secondary.main', color: 'white', '&:hover': { bgcolor: 'secondary.dark' } }
                  }}
                >
                  <ListItemText primary={op.label} />
                </ListItem>
              ))}
            </List>
          </Drawer>
        </>
      ) : (
        /* Desktop: chips horizontales como estaban */
        <Stack direction="row" spacing={1} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          {TIPOS.map(tp => (
            <Chip
              key={tp.value}
              label={tp.label}
              onClick={() => setTipoFiltro(tp.value)}
              color={tipoFiltro === tp.value ? 'primary' : 'default'}
              variant={tipoFiltro === tp.value ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer', flexShrink: 0 }}
            />
          ))}
        </Stack>
      )}

      {/* Error */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Contenido */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : productos.length === 0 ? (
        <Alert severity="info">{t.noResults} — {t.noResultsHint}</Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t.showing} {productosMostrados.length} {t.of} {productosOrdenados.length} {t.products}
          </Typography>

          <Grid container spacing={{ xs: 1.5, sm: 3 }}>
            {productosMostrados.map(prod => {
              const rating = ratings[prod.id];
              return (
                <Grid item key={prod.id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDark
                          ? '0 8px 30px rgba(99,102,241,0.25)'
                          : '0 8px 30px rgba(99,102,241,0.15)',
                      }
                    }}
                    onClick={() => { setSelected(prod); setModalOpen(true); }}
                  >
                    {/* Imagen */}
                    <CardMedia
                      component="img"
                      height={isMobile ? 110 : 160}
                      image={prod.urlPortada || prod.urlArchivo || 'https://via.placeholder.com/300?text=Sin+Imagen'}
                      alt={prod.titulo}
                      loading="lazy"
                      sx={{ objectFit: 'cover' }}
                    />

                    {/* Contenido */}
                    <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 }, pb: { xs: 0.5, sm: 1 } }}>
                      {/* Vendedor */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Avatar
                          sx={{ width: { xs: 16, sm: 22 }, height: { xs: 16, sm: 22 }, fontSize: '0.65rem', bgcolor: 'primary.main' }}
                          src={prod.vendedor?.fotoUrl}
                        >
                          {prod.vendedor?.nombreMostrado?.charAt(0) || '?'}
                        </Avatar>
                        <Typography variant="caption" fontWeight="bold" noWrap sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                          {prod.vendedor?.nombreMostrado || 'Vendedor'}
                        </Typography>
                      </Box>

                      {/* Título */}
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{
                          lineHeight: 1.2,
                          height: '2.4em',
                          overflow: 'hidden',
                          fontSize: { xs: '0.72rem', sm: '0.875rem' }
                        }}
                      >
                        {prod.titulo}
                      </Typography>

                      {/* Rating */}
                      {rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Rating
                            value={rating.promedio}
                            precision={0.1}
                            size="small"
                            readOnly
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.9rem' } }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                            {rating.promedio.toFixed(1)} ({rating.total})
                          </Typography>
                        </Box>
                      )}

                      {/* Tipo + Precio */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Chip
                          label={prod.tipo?.replace(/_/g, ' ')}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: { xs: '0.55rem', sm: '0.75rem' }, height: { xs: 18, sm: 24 } }}
                        />
                        <Typography
                          variant="h6"
                          color="success.main"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.85rem', sm: '1.25rem' } }}
                        >
                          ${prod.precio}
                        </Typography>
                      </Box>
                    </CardContent>

                    {/* Acciones */}
                    <CardActions sx={{ p: { xs: 1, sm: 2 }, pt: 0, gap: 0.5 }}>
                      <Button
                        variant="contained"
                        startIcon={isMobile ? null : <ShoppingCartIcon />}
                        fullWidth
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          borderRadius: 2,
                          fontSize: { xs: '0.65rem', sm: '0.875rem' },
                          py: { xs: 0.5, sm: 1 },
                          minHeight: { xs: 44, sm: 'auto' }
                        }}
                        onClick={e => { e.stopPropagation(); setSelected(prod); setModalOpen(true); }}
                      >
                        {isMobile ? <ShoppingCartIcon fontSize="small" /> : t.buyAndView}
                      </Button>

                      {prod.vendedor && String(prod.vendedor.id) === usuarioLogueado && (
                        <Button
                          size="small"
                          color="error"
                          onClick={e => handleEliminar(e, prod.id)}
                          sx={{ minWidth: { xs: 30, sm: 42 }, borderRadius: 2, p: { xs: 0.5, sm: 1 } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Cargar más */}
          {hayMas && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {productosOrdenados.length - visibles} {t.products} más
              </Typography>
              <Button
                variant="outlined"
                size="large"
                endIcon={<ExpandMoreIcon />}
                onClick={handleVerMas}
                sx={{ borderRadius: 3, px: 4 }}
              >
                {t.loadMore}
              </Button>
            </Box>
          )}
        </>
      )}

      <ProductoModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); }}
        producto={selected}
      />

      {/* Snackbar de notificaciones */}
      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={confirmDlg.open} onClose={() => setConfirmDlg({ open: false, id: null })}>
        <DialogTitle>¿Eliminar producto?</DialogTitle>
        <DialogContent>
          <DialogContentText>Esta acción no se puede deshacer.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDlg({ open: false, id: null })}>Cancelar</Button>
          <Button onClick={handleConfirmEliminar} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home;
