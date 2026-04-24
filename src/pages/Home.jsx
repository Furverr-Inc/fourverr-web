import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Card, CardMedia, CardContent, Typography,
  CardActions, Button, Chip, Box, CircularProgress, Alert, Skeleton,
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
import api from '../services/api';
import ProductoModal from '../components/ProductoModal';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import {
  BRAND_NAVY, BRAND_NAVY_TOP, BRAND_PERIW, BRAND_PERIW_HOVER, BRAND_BORDER, BRAND_TEXT,
} from '../brandColors';

const PAGE_SIZE = 12;

/* Radios: tarjetas moderadas (~20px); entradas y chips en píldora para coherencia visual */
const R_CARD = '20px';
const R_PILL = '9999px';

/** Scroll horizontal discreto (categorías): fino, sin flechas en WebKit, refuerzo al hover */
const sxCategoryScrollRow = (isDark) => ({
  overflowX: 'auto',
  overflowY: 'hidden',
  WebkitOverflowScrolling: 'touch',
  pb: 0.75,
  mb: 4,
  scrollbarWidth: 'thin',
  scrollbarColor: `${isDark ? 'rgba(232,233,240,0.45)' : 'rgba(139,143,200,0.55)'} transparent`,
  '&::-webkit-scrollbar': { height: 6 },
  '&::-webkit-scrollbar-track': { background: 'transparent' },
  '&::-webkit-scrollbar-button': { display: 'none', width: 0, height: 0 },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: isDark ? 'rgba(232,233,240,0.38)' : 'rgba(139,143,200,0.55)',
    borderRadius: 10,
    border: '1px solid transparent',
    backgroundClip: 'padding-box',
    transition: 'background-color 0.2s ease',
  },
  '&:hover::-webkit-scrollbar-thumb': {
    backgroundColor: isDark ? 'rgba(232,233,240,0.6)' : 'rgba(139,143,200,0.85)',
  },
});

/** Categoría seleccionada: claro = píldora navy (como antes); oscuro = píldora clara sobre fondo navy (inverso legible). */
const sxCategoryChipSelected = (isDark) =>
  isDark
    ? {
        bgcolor: BRAND_TEXT,
        color: BRAND_NAVY,
        borderColor: 'rgba(232,233,240,0.95)',
        fontWeight: 600,
        WebkitTapHighlightColor: 'transparent',
        '&:hover': { bgcolor: '#D8DAE8', borderColor: '#C8CBD8' },
        '&:active': {
          bgcolor: '#D0D3E0',
          color: BRAND_NAVY,
          borderColor: 'rgba(232,233,240,0.95)',
        },
      }
    : {
        bgcolor: BRAND_NAVY,
        color: '#fff',
        borderColor: BRAND_NAVY,
        fontWeight: 600,
        WebkitTapHighlightColor: 'transparent',
        '&:hover': { bgcolor: BRAND_NAVY_TOP, borderColor: BRAND_NAVY_TOP },
        '&:active': {
          bgcolor: BRAND_NAVY_TOP,
          color: '#fff',
          borderColor: BRAND_NAVY_TOP,
        },
      };

const sxDrawerItemSelected = (isDark) =>
  isDark
    ? {
        bgcolor: BRAND_TEXT,
        color: BRAND_NAVY,
        '& .MuiListItemText-primary': { color: BRAND_NAVY },
        '&:hover': { bgcolor: '#D8DAE8' },
        '&:active': { bgcolor: '#D0D3E0' },
      }
    : {
        bgcolor: BRAND_NAVY,
        color: 'white',
        '& .MuiListItemText-primary': { color: '#fff' },
        '&:hover': { bgcolor: BRAND_NAVY_TOP },
        '&:active': { bgcolor: BRAND_NAVY_TOP },
      };

/** Fila drawer sin selección: feedback táctil sin flash gris del tema */
const sxDrawerRowUnselected = (isDark) => ({
  WebkitTapHighlightColor: 'transparent',
  '&:active': {
    bgcolor: isDark ? 'rgba(139,143,200,0.14)' : 'rgba(139,143,200,0.12)',
  },
});

/** Misma columna centrada que el grid de tarjetas (categorías + listado alineados) */
const sxListingColumn = {
  width: '100%',
  maxWidth: { xs: '100%', md: 1040, lg: 1100, xl: 1160 },
  mx: { xs: 0, md: 'auto' },
  px: { xs: 0, sm: 0, md: 2, lg: 3, xl: 4 },
};

const Home = () => {
  const [productos, setProductos]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [selected, setSelected]     = useState(null);
  const [busqueda, setBusqueda]     = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [visibles, setVisibles]     = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [anchorEl, setAnchorEl]     = useState(null); // Para el menú de filtros en móvil
  const [orden, setOrden]           = useState('');   // Para ordenamiento

  const { isDark } = useThemeMode();
  const { lang, t } = useLanguage();
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

  const handleVerMas = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nuevoVisibles = visibles + PAGE_SIZE;
      setVisibles(nuevoVisibles);
      await cargarRatings(productosOrdenados.slice(visibles, nuevoVisibles));
    } finally {
      setLoadingMore(false);
    }
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
  const tipoLabel = TIPOS.find(tp => tp.value === tipoFiltro)?.label || '';
  const sortChipLabel =
    orden === 'top' ? t.sortTopRated
    : orden === 'low' ? t.sortLowRated
    : orden === 'newest' ? t.sortNewest
    : orden === 'oldest' ? t.sortOldest
    : '';

  return (
    <Container
      maxWidth="xl"
      sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 1.5, sm: 3, md: 4 } }}
    >

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
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: R_PILL,
            bgcolor: 'background.paper',
            '& fieldset': { borderColor: 'rgba(13,17,39,0.12)' },
            '&:hover fieldset': { borderColor: BRAND_PERIW },
            '&.Mui-focused fieldset': { borderColor: BRAND_PERIW, borderWidth: 1 },
          },
        }}
      />

      {/* ─── FILTROS ─── */}
      {isMobile ? (
        <>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            px: 0.5,
            gap: 1,
            minWidth: 0,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
              <Chip
                label={tipoLabel || t.categories.all}
                size="small"
                onDelete={tipoFiltro ? () => setTipoFiltro('') : undefined}
                disableRipple
                sx={{
                  height: 22, fontSize: '0.7rem',
                  borderRadius: R_PILL,
                  bgcolor: BRAND_NAVY, color: '#fff',
                  maxWidth: '100%',
                  WebkitTapHighlightColor: 'transparent',
                  '&:active': { bgcolor: BRAND_NAVY_TOP },
                  '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                  '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#fff' } },
                }}
              />
              {orden && (
                <Chip
                  label={sortChipLabel}
                  size="small"
                  onDelete={() => setOrden('')}
                  disableRipple
                  sx={{
                    height: 22, fontSize: '0.7rem',
                    borderRadius: R_PILL,
                    bgcolor: BRAND_NAVY, color: '#fff',
                    WebkitTapHighlightColor: 'transparent',
                    '&:active': { bgcolor: BRAND_NAVY_TOP },
                    '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#fff' } },
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
                sx={{ textTransform: lang === 'en' ? 'lowercase' : 'none' }}
              >
                {t.filtersNoun}
              </Typography>
              <IconButton
                size="small"
                onClick={e => setAnchorEl(e.currentTarget)}
                aria-label={t.filtersDrawerTitle}
                disableRipple
                sx={{
                  WebkitTapHighlightColor: 'transparent',
                  bgcolor: anchorEl ? BRAND_NAVY : 'action.hover',
                  color: anchorEl ? 'white' : 'text.primary',
                  borderRadius: R_PILL,
                  '&:hover': { bgcolor: BRAND_NAVY_TOP, color: 'white' },
                  '&:active': {
                    bgcolor: anchorEl ? BRAND_NAVY_TOP : 'rgba(139,143,200,0.22)',
                    color: anchorEl ? 'white' : 'text.primary',
                  },
                }}
              >
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Mobile: Bottom Sheet for filters */}
          <Drawer
            anchor="bottom"
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                borderTopLeftRadius: R_CARD,
                borderTopRightRadius: R_CARD,
                maxHeight: '70vh',
                pb: 2,
              },
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="bold">{t.filtersDrawerTitle}</Typography>
            </Box>
            <List sx={{ py: 0 }}>
              {/* Sección categorías */}
              <ListItem disabled sx={{ opacity: 1, py: 0 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, px: 2 }}>
                  {t.categoriesSection}
                </Typography>
              </ListItem>
              {TIPOS.map(tp => (
                <ListItem
                  key={tp.value}
                  button
                  selected={tipoFiltro === tp.value}
                  onClick={() => { setTipoFiltro(tp.value); setAnchorEl(null); }}
                  disableRipple
                  sx={{
                    borderRadius: R_CARD,
                    mx: 1,
                    minHeight: 44,
                    WebkitTapHighlightColor: 'transparent',
                    '&.Mui-selected': sxDrawerItemSelected(isDark),
                    ...(tipoFiltro !== tp.value ? sxDrawerRowUnselected(isDark) : {}),
                  }}
                >
                  <ListItemText primary={tp.label} />
                </ListItem>
              ))}

              <ListItem disabled sx={{ opacity: 1, py: 0, mt: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, px: 2 }}>
                  {t.sortSection}
                </Typography>
              </ListItem>
              {[
                { value: 'top', label: t.sortTopRated },
                { value: 'low', label: t.sortLowRated },
                { value: 'newest', label: t.sortNewest },
                { value: 'oldest', label: t.sortOldest },
              ].map(op => (
                <ListItem
                  key={op.value}
                  button
                  selected={orden === op.value}
                  onClick={() => { setOrden(op.value); setAnchorEl(null); }}
                  disableRipple
                  sx={{
                    borderRadius: R_CARD,
                    mx: 1,
                    minHeight: 44,
                    WebkitTapHighlightColor: 'transparent',
                    '&.Mui-selected': sxDrawerItemSelected(isDark),
                    ...(orden !== op.value ? sxDrawerRowUnselected(isDark) : {}),
                  }}
                >
                  <ListItemText primary={op.label} />
                </ListItem>
              ))}
            </List>
          </Drawer>
        </>
      ) : (
        /* Desktop: categorías en la misma columna centrada que el grid de gigs */
        <Box sx={sxListingColumn}>
          <Box sx={sxCategoryScrollRow(isDark)}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'nowrap', width: 'max-content', py: 0.25 }}>
              {TIPOS.map(tp => (
                <Chip
                  key={tp.value}
                  label={tp.label}
                  onClick={() => setTipoFiltro(tp.value)}
                  variant="outlined"
                  disableRipple
                  sx={{
                    cursor: 'pointer',
                    flexShrink: 0,
                    borderRadius: R_PILL,
                    py: 2.25,
                    px: 0.5,
                    fontWeight: tipoFiltro === tp.value ? 600 : 500,
                    ...(tipoFiltro === tp.value
                      ? sxCategoryChipSelected(isDark)
                      : {
                          borderColor: BRAND_BORDER,
                          WebkitTapHighlightColor: 'transparent',
                          '&:hover': {
                            borderColor: BRAND_PERIW,
                            bgcolor: 'rgba(139,143,200,0.1)',
                          },
                          '&:active': {
                            borderColor: BRAND_PERIW,
                            bgcolor: 'rgba(139,143,200,0.16)',
                          },
                        }),
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      )}

      {/* Error */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Contenido */}
      {loading ? (
        <Box sx={sxListingColumn}>
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 1.5, sm: 2.25, md: 2.5 },
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Box key={i} sx={{ borderRadius: R_CARD, overflow: 'hidden' }}>
                <Skeleton variant="rectangular" height={isMobile ? 110 : 160} animation="wave" />
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="85%" />
                  <Skeleton variant="text" width="60%" />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Skeleton variant="rectangular" width={64} height={22} sx={{ borderRadius: 999 }} />
                    <Skeleton variant="text" width={48} height={28} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ) : productos.length === 0 ? (
        <Alert severity="info">{t.noResults} — {t.noResultsHint}</Alert>
      ) : (
        <>
          <Box sx={sxListingColumn}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t.showing} {productosMostrados.length} {t.of} {productosOrdenados.length} {t.products}
            </Typography>

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
            {productosMostrados.map(prod => {
              const rating = ratings[prod.id];
              return (
                <Card
                  key={prod.id}
                  sx={{
                    height: '100%',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: R_CARD,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    willChange: 'transform',
                    transition: 'transform 200ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms cubic-bezier(.2,.8,.2,1)',
                    '& .zento-card-media': {
                      transition: 'transform 320ms cubic-bezier(.2,.8,.2,1)',
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDark
                        ? '0 12px 32px rgba(13,17,39,0.35)'
                        : '0 12px 32px rgba(13,17,39,0.12)',
                    },
                    '&:hover .zento-card-media': { transform: 'scale(1.04)' },
                    '&:active': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(13,17,39,0.28)'
                        : '0 8px 20px rgba(13,17,39,0.1)',
                    },
                  }}
                  onClick={() => { setSelected(prod); setModalOpen(true); }}
                >
                    {/* Imagen con zoom suave al hover */}
                    <Box sx={{ overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        className="zento-card-media"
                        height={isMobile ? 110 : 160}
                        image={prod.urlPortada || prod.urlArchivo || 'https://via.placeholder.com/300?text=Sin+Imagen'}
                        alt={prod.titulo}
                        loading="lazy"
                        sx={{ width: '100%', objectFit: 'cover' }}
                      />
                    </Box>

                    {/* Contenido */}
                    <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 }, pb: { xs: 0.5, sm: 1 } }}>
                      {/* Vendedor */}
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
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.9rem' },
                              '& .MuiRating-iconFilled': { color: '#e8b006' },
                              '& .MuiRating-iconEmpty': {
                                color: isDark ? 'rgba(200,202,212,0.25)' : 'rgba(13,17,39,0.18)',
                              },
                            }}
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
                          variant="outlined"
                          sx={{
                            fontSize: { xs: '0.55rem', sm: '0.75rem' },
                            height: { xs: 20, sm: 26 },
                            borderRadius: R_PILL,
                            '& .MuiChip-label': { px: { xs: 1, sm: 1.25 } },
                            ...(isDark
                              ? {
                                  borderColor: BRAND_BORDER,
                                  color: 'rgba(200,202,212,0.92)',
                                  bgcolor: 'rgba(255,255,255,0.06)',
                                  '&:hover': { bgcolor: 'rgba(139,143,200,0.12)' },
                                }
                              : {
                                  borderColor: BRAND_PERIW,
                                  color: BRAND_NAVY,
                                  bgcolor: 'rgba(139,143,200,0.08)',
                                }),
                          }}
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
                          borderRadius: R_PILL,
                          fontSize: { xs: '0.65rem', sm: '0.875rem' },
                          py: { xs: 0.5, sm: 1 },
                          minHeight: { xs: 44, sm: 'auto' },
                          bgcolor: BRAND_NAVY,
                          '&:hover': { bgcolor: BRAND_NAVY_TOP },
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
                          sx={{ minWidth: { xs: 30, sm: 42 }, borderRadius: R_PILL, p: { xs: 0.5, sm: 1 } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      )}
                    </CardActions>
                  </Card>
              );
            })}
            </Box>
          </Box>

          {/* Cargar más */}
          {hayMas && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {productosOrdenados.length - visibles} {t.products} más
              </Typography>
              <Button
                variant="outlined"
                size="large"
                disabled={loadingMore}
                endIcon={loadingMore
                  ? <CircularProgress size={18} sx={{ color: BRAND_PERIW }} />
                  : <ExpandMoreIcon />}
                onClick={handleVerMas}
                sx={{
                  borderRadius: R_PILL,
                  px: 4,
                  borderColor: BRAND_PERIW,
                  color: BRAND_NAVY,
                  '&:hover': {
                    borderColor: BRAND_PERIW_HOVER,
                    bgcolor: 'rgba(139,143,200,0.1)',
                  },
                }}
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
