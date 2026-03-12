import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Box, Typography, Avatar, Button,
  CircularProgress, Alert, Chip, Divider, IconButton, Grid,
  Card, CardMedia, CardContent, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Rating
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChatCompra from '../components/ChatCompra';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RateReviewIcon from '@mui/icons-material/RateReview';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import ProductoModal from '../components/ProductoModal';

// ── StatCard ──
const StatCard = ({ icon, label, value, color, isDark }) => (
  <Paper elevation={0} sx={{
    p: 2, borderRadius: 3, border: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    display: 'flex', alignItems: 'center', gap: 1.5,
  }}>
    <Box sx={{
      width: 44, height: 44, borderRadius: 2, background: `${color}22`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {React.cloneElement(icon, { sx: { color, fontSize: 22 } })}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{value}</Typography>
    </Box>
  </Paper>
);

const estadoColor = (e) => e === 'PAGADO' ? 'success' : e === 'PENDIENTE' ? 'warning' : 'error';

const Perfil = () => {
  const [perfil, setPerfil]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [success, setSuccess]   = useState('');
  const navigate = useNavigate();
  const { isDark } = useThemeMode();
  const { t } = useLanguage();

  const [compras, setCompras]     = useState([]);
  const [ventas, setVentas]       = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  // Modal de producto (desde favoritos)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProd, setModalProd] = useState(null);

  // Dialog de rating
  const [ratingDialog, setRatingDialog]   = useState(false);
  const [ratingPedido, setRatingPedido]   = useState(null);
  const [ratingVal, setRatingVal]         = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingCheck, setRatingCheck]     = useState({}); // { [pedidoId]: boolean }

  const getBadge = (n) => {
    if (n >= 10) return { label: t.levelVip,    color: '#f59e0b', icon: '👑', bg: 'rgba(245,158,11,0.12)' };
    if (n >= 3)  return { label: t.levelActive, color: '#6366f1', icon: '⚡', bg: 'rgba(99,102,241,0.12)' };
    return           { label: t.levelNew,      color: '#10b981', icon: '🌱', bg: 'rgba(16,185,129,0.12)' };
  };

  const cargarPerfil = async () => {
    try { const r = await api.get('/users/perfil'); setPerfil(r.data); }
    catch { setError('No se pudo cargar el perfil'); }
    finally { setLoading(false); }
  };

  const cargarDatosExtra = async () => {
    const [comprasRes, favRes] = await Promise.allSettled([
      api.get('/pedidos/mis-compras'),
      api.get('/favoritos'),
    ]);
    const comprasData = comprasRes.status === 'fulfilled' ? (comprasRes.value.data || []) : [];
    setCompras(comprasData);
    if (favRes.status === 'fulfilled') setFavoritos(favRes.value.data || []);

    // Verificar cuáles pedidos ya tienen reseña
    const pagados = comprasData.filter(c => c.estado === 'PAGADO');
    const checks = {};
    await Promise.all(pagados.map(async (p) => {
      try {
        const r = await api.get(`/resenas/check/${p.id}`);
        checks[p.id] = r.data.yaReseno;
      } catch { checks[p.id] = false; }
    }));
    setRatingCheck(checks);
  };

  const cargarVentas = async () => {
    try { const r = await api.get('/pedidos/mis-ventas'); setVentas(r.data || []); }
    catch { setVentas([]); }
  };

  useEffect(() => { cargarPerfil(); }, []);
  useEffect(() => {
    if (!perfil) return;
    cargarDatosExtra();
    if (perfil.role === 'SELLER' || perfil.role === 'ADMIN') cargarVentas();
  }, [perfil]);

  const handleFotoClick = () => document.getElementById('input-foto').click();
  const handleCambiarFoto = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (!['image/jpeg','image/png'].includes(archivo.type)) { alert('Solo JPG o PNG'); return; }
    const fd = new FormData(); fd.append('archivo', archivo);
    try {
      setSubiendo(true);
      const r = await api.post('/users/perfil/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPerfil(p => ({ ...p, fotoUrl: r.data.url }));
    } catch { alert('Error al actualizar la foto'); }
    finally { setSubiendo(false); }
  };

  const handleSolicitarVendedor = async () => {
    try {
      await api.post('/users/solicitar-vendedor');
      setSuccess('Solicitud enviada. Esperando aprobación del Administrador.');
      cargarPerfil(); setTimeout(() => setSuccess(''), 5000);
    } catch { setError('Error al enviar la solicitud'); setTimeout(() => setError(''), 3000); }
  };

  const handleAbrirRating = (pedido) => {
    setRatingPedido(pedido); setRatingVal(0); setRatingComment('');
    setRatingDialog(true);
  };

  const handleEnviarRating = async () => {
    if (!ratingVal) return;
    setRatingLoading(true);
    try {
      await api.post('/resenas', { pedidoId: ratingPedido.id, calificacion: ratingVal, comentario: ratingComment });
      setRatingCheck(prev => ({ ...prev, [ratingPedido.id]: true }));
      setRatingDialog(false);
      setSuccess(t.ratingSuccess);
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError(t.ratingError); setTimeout(() => setError(''), 3000); }
    finally { setRatingLoading(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error && !perfil) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;

  const esSeller = perfil?.role === 'SELLER' || perfil?.role === 'ADMIN';
  const comprasPagadas = compras.filter(c => c.estado === 'PAGADO');
  const badge = getBadge(comprasPagadas.length);

  const ventasPagadas    = ventas.filter(v => v.estado === 'PAGADO');
  const totalGanancias   = ventasPagadas.reduce((a, v) => a + (v.montoVendedor || 0), 0);
  const ventasPendientes = ventas.filter(v => v.estado === 'PENDIENTE').length;
  const promedioVenta    = ventasPagadas.length > 0 ? totalGanancias / ventasPagadas.length : 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>

        {/* ══════════════════════════════════════════
            FILA 1: Info usuario + Panel derecho
        ══════════════════════════════════════════ */}

        {/* Info de perfil */}
        <Grid item xs={12} md={esSeller ? 4 : 5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            {/* Avatar + datos */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <input accept="image/jpeg,image/png" id="input-foto" type="file" style={{ display: 'none' }} onChange={handleCambiarFoto} />
                <IconButton onClick={handleFotoClick} disabled={subiendo} sx={{ p: 0, '&:hover .overlay': { opacity: 1 } }}>
                  <Avatar src={perfil?.fotoUrl} sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.main' }}>
                    {!perfil?.fotoUrl && (perfil?.nombreMostrado?.charAt(0) || 'U')}
                  </Avatar>
                  <Box className="overlay" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }}>
                    <PhotoCamera sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  {subiendo && <CircularProgress size={80} sx={{ position: 'absolute', top: 0, left: 0, color: 'primary.main', zIndex: 1 }} />}
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight="bold" noWrap>{perfil?.nombreMostrado || perfil?.username}</Typography>
                <Typography variant="body2" color="text.secondary">@{perfil?.username}</Typography>
                <Box sx={{ display: 'flex', gap: 0.8, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip label={perfil?.role} color={perfil?.role === 'SELLER' ? 'success' : perfil?.role === 'ADMIN' ? 'error' : 'default'} size="small" />
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.2, borderRadius: 10, bgcolor: badge.bg, border: `1px solid ${badge.color}33` }}>
                    <Typography sx={{ fontSize: '0.65rem' }}>{badge.icon}</Typography>
                    <Typography variant="caption" sx={{ color: badge.color, fontWeight: 'bold', fontSize: '0.7rem' }}>{badge.label}</Typography>
                  </Box>
                </Box>
              </Box>
              <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => navigate('/editar-perfil')} sx={{ flexShrink: 0 }}>
                {t.editProfile}
              </Button>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</Typography>
              <Typography variant="body2">{perfil?.email}</Typography>
            </Box>

            {perfil?.descripcion ? (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Bio</Typography>
                <Typography variant="body2">{perfil.descripcion}</Typography>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 1.5, fontSize: '0.78rem', py: 0.5 }}>{t.addDescription}</Alert>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {esSeller && (
                <Button variant="contained" fullWidth startIcon={<StorefrontIcon />} onClick={() => navigate('/mis-publicaciones')} sx={{ borderRadius: 2 }}>
                  {t.myPublications}
                </Button>
              )}
              {perfil?.role === 'USER' && !perfil?.solicitudVendedor && (
                <Button variant="outlined" fullWidth onClick={handleSolicitarVendedor} sx={{ borderRadius: 2 }}>
                  {t.requestSeller}
                </Button>
              )}
              {perfil?.solicitudVendedor && perfil?.role === 'USER' && (
                <Alert severity="warning" sx={{ fontSize: '0.78rem', py: 0.5 }}>{t.pendingRequest}</Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* ── Panel derecho (actividad USER o ganancias SELLER) ── */}
        {!esSeller ? (
          /* Mi Actividad — USER */
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <EmojiEventsIcon sx={{ color: '#f59e0b' }} />
                <Typography variant="h6" fontWeight="bold">{t.myActivity}</Typography>
              </Box>
              <Grid container spacing={2}>
                {[
                  { icon: <ShoppingBagIcon />,     label: t.purchases,  value: compras.length,   color: '#6366f1' },
                  { icon: <FavoriteIcon />,         label: t.favorites,  value: favoritos.length, color: '#ef4444' },
                  { icon: <WorkspacePremiumIcon />, label: t.level,      value: badge.label,       color: badge.color },
                ].map(s => (
                  <Grid item xs={12} sm={4} key={s.label}>
                    <StatCard {...s} isDark={isDark} />
                  </Grid>
                ))}
              </Grid>

              {/* Últimas compras resumen inline */}
              {compras.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold' }}>
                    {t.latestSales || 'Últimas compras'}
                  </Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {compras.slice(0, 4).map(p => (
                      <Box key={p.id} sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, p: 1.2,
                        borderRadius: 2, border: '1px solid', borderColor: 'divider',
                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                      }}>
                        <Avatar src={p.producto?.urlPortada} variant="rounded"
                          sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                          {p.producto?.titulo?.charAt(0) || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight="bold" noWrap>{p.producto?.titulo || 'Producto'}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{p.producto?.vendedor?.nombreMostrado}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography variant="body2" fontWeight="bold" color="success.main">${p.producto?.precio}</Typography>
                          <Chip label={p.estado} color={estadoColor(p.estado)} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                        </Box>
                        {/* Botón calificar */}
                        {p.estado === 'PAGADO' && !ratingCheck[p.id] && (
                          <Button size="small" variant="outlined" startIcon={<RateReviewIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={() => handleAbrirRating(p)}
                            sx={{ borderRadius: 2, fontSize: '0.7rem', px: 1, py: 0.3, flexShrink: 0 }}>
                            {t.rateProduct}
                          </Button>
                        )}
                        {p.estado === 'PAGADO' && ratingCheck[p.id] && (
                          <Chip label="⭐ Reseñado" size="small" sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: '0.65rem', height: 20 }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        ) : (
          /* Panel de Ganancias — SELLER */
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 26 }} />
                <Typography variant="h6" fontWeight="bold">{t.earningsPanel}</Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {[
                  { icon: <AccountBalanceWalletIcon />, label: t.availableBalance, value: `$${Number(perfil?.saldoDisponible || 0).toFixed(2)}`, color: '#10b981' },
                  { icon: <AttachMoneyIcon />,          label: t.totalEarned,       value: `$${totalGanancias.toFixed(2)}`,                        color: '#6366f1' },
                  { icon: <ReceiptLongIcon />,          label: t.completedSales,    value: ventasPagadas.length,                                    color: '#f59e0b' },
                  { icon: <HourglassEmptyIcon />,       label: t.pendingLabel,      value: ventasPendientes,                                        color: '#ef4444' },
                ].map(s => (
                  <Grid item xs={6} sm={3} key={s.label}>
                    <StatCard {...s} isDark={isDark} />
                  </Grid>
                ))}
              </Grid>

              {ventasPagadas.length > 0 && (
                <Box sx={{ p: 2, borderRadius: 2, background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)', border: '1px solid', borderColor: isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)', mb: 2.5 }}>
                  <Typography variant="caption" color="text.secondary">{t.avgPerSale}</Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">${promedioVenta.toFixed(2)}</Typography>
                </Box>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold' }}>
                {t.latestSales}
              </Typography>
              {ventas.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <ReceiptLongIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 0.5 }} />
                  <Typography color="text.secondary" variant="body2">{t.noSalesYet}</Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 240, overflowY: 'auto', mt: 1.5 }}>
                  {ventas.slice(0, 10).map((v, i) => (
                    <React.Fragment key={v.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={v.producto?.urlPortada} variant="rounded" sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                            {v.producto?.titulo?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{v.producto?.titulo || 'Producto'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {v.cliente?.nombreMostrado || v.cliente?.username || 'Cliente'} · {v.fechaPedido ? new Date(v.fechaPedido).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : ''}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold" color="success.main">+${Number(v.montoVendedor || 0).toFixed(2)}</Typography>
                            <Chip label={v.estado} color={estadoColor(v.estado)} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                          </Box>
                          <ChatCompra
                            pedidoId={v.id}
                            vendedorNombre={v.cliente?.nombreMostrado || v.cliente?.username}
                            vendedorFoto={v.cliente?.fotoUrl}
                            vendedorId={v.cliente?.id}
                          />
                        </Box>
                      </Box>
                      {i < Math.min(ventas.length - 1, 9) && <Divider />}
                    </React.Fragment>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* ══════════════════════════════════════════
            FILA 2: Guardados + Historial de compras completo
        ══════════════════════════════════════════ */}

        {/* GUARDADOS (Wishlist) */}
        {favoritos.length > 0 && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FavoriteIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight="bold">{t.saved}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">{favoritos.length}</Typography>
              </Box>
              <Grid container spacing={1.5}>
                {favoritos.slice(0, 4).map(prod => (
                  <Grid item xs={6} key={prod.id}>
                    <Card elevation={0} onClick={() => { setModalProd(prod); setModalOpen(true); }}
                      sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer',
                        transition: '0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3, borderColor: 'primary.main' } }}>
                      <CardMedia component="img" height="80"
                        image={prod.urlPortada || prod.urlArchivo || 'https://via.placeholder.com/200?text=?'}
                        alt={prod.titulo} sx={{ objectFit: 'cover' }} />
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Typography variant="caption" fontWeight="bold" noWrap display="block" sx={{ fontSize: '0.7rem' }}>{prod.titulo}</Typography>
                        <Typography variant="caption" color="success.main" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>${prod.precio}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {favoritos.length > 4 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  +{favoritos.length - 4} {t.moreItems}
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* HISTORIAL DE COMPRAS */}
        {compras.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingBagIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight="bold">{t.myPurchases}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">{compras.length} {t.purchasesTotal}</Typography>
              </Box>
              <Grid container spacing={2}>
                {compras.slice(0, 6).map((pedido, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={pedido.id}>
                    <Card elevation={0} sx={{
                      borderRadius: 3,
                      border: '1px solid', borderColor: 'divider',
                      transition: '0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                    }}>
                      <CardMedia component="img" height="140"
                        image={pedido.producto?.urlPortada || pedido.producto?.urlArchivo || 'https://via.placeholder.com/400x140?text=?'}
                        alt={pedido.producto?.titulo}
                        sx={{ objectFit: 'cover', borderRadius: '12px 12px 0 0' }} />
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="body1" fontWeight="bold" noWrap>
                          {pedido.producto?.titulo || 'Producto'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ mb: 1 }}>
                          {pedido.producto?.vendedor?.nombreMostrado}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                            ${pedido.producto?.precio}
                          </Typography>
                          <Chip
                            icon={pedido.estado === 'PAGADO'
                              ? <CheckCircleIcon sx={{ fontSize: '13px !important' }} />
                              : <HourglassEmptyIcon sx={{ fontSize: '13px !important' }} />}
                            label={pedido.estado}
                            color={estadoColor(pedido.estado)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {pedido.estado === 'PAGADO' && !ratingCheck[pedido.id] ? (
                            <Button
                              size="small" variant="outlined"
                              startIcon={<RateReviewIcon sx={{ fontSize: '14px !important' }} />}
                              onClick={() => handleAbrirRating(pedido)}
                              sx={{ flex: 1, borderRadius: 2, fontSize: '0.72rem', py: 0.5, textTransform: 'none' }}
                            >
                              {t.rateProduct}
                            </Button>
                          ) : pedido.estado === 'PAGADO' && ratingCheck[pedido.id] ? (
                            <Chip label="⭐ Reseñado" size="small"
                              sx={{ flex: 1, bgcolor: 'rgba(245,158,11,0.1)', color: '#d97706', fontWeight: 600 }} />
                          ) : (
                            <Box sx={{ flex: 1 }} />
                          )}
                          <ChatCompra
                            pedidoId={pedido.id}
                            vendedorNombre={pedido.producto?.vendedor?.nombreMostrado || pedido.producto?.vendedor?.username}
                            vendedorFoto={pedido.producto?.vendedor?.fotoUrl}
                            vendedorId={pedido.producto?.vendedor?.id}
                            chatIndex={idx % 3}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {compras.length > 6 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                  +{compras.length - 6} {t.morePurchases}
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

      </Grid>

      {/* ── Modal producto (desde favoritos) ── */}
      <ProductoModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setModalProd(null); }}
        producto={modalProd}
      />

      {/* ── Dialog de rating ── */}
      <Dialog open={ratingDialog} onClose={() => setRatingDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RateReviewIcon color="primary" />
            <Typography fontWeight="bold">{t.ratingTitle}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {ratingPedido && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
              <Avatar src={ratingPedido.producto?.urlPortada} variant="rounded" sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: 'primary.main' }}>
                {ratingPedido.producto?.titulo?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold">{ratingPedido.producto?.titulo}</Typography>
                <Typography variant="caption" color="text.secondary">{ratingPedido.producto?.vendedor?.nombreMostrado}</Typography>
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Rating
              value={ratingVal}
              onChange={(_, v) => setRatingVal(v)}
              size="large"
              sx={{ fontSize: '2.5rem' }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {ratingVal === 1 ? '😞 Muy malo' : ratingVal === 2 ? '😐 Malo' : ratingVal === 3 ? '🙂 Regular' : ratingVal === 4 ? '😊 Bueno' : ratingVal === 5 ? '🤩 Excelente' : 'Selecciona una calificación'}
            </Typography>
          </Box>
          <TextField
            fullWidth multiline rows={3}
            label={t.ratingComment}
            value={ratingComment}
            onChange={e => setRatingComment(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
          <Button onClick={() => setRatingDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>{t.cancel || 'Cancelar'}</Button>
          <Button onClick={handleEnviarRating} variant="contained" disabled={!ratingVal || ratingLoading}
            sx={{ borderRadius: 2, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', flex: 1 }}>
            {ratingLoading ? <CircularProgress size={20} color="inherit" /> : t.submitRating}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Perfil;
