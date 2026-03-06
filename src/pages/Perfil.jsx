import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Box, Typography, Avatar, Button,
  CircularProgress, Alert, Chip, Divider, IconButton, Grid,
  Dialog, DialogTitle, DialogContent, List, ListItem,
  ListItemAvatar, ListItemText, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';

const StatCard = ({ icon, label, value, color, isDark }) => (
  <Paper elevation={0} sx={{
    p: 2.5,
    borderRadius: 3,
    border: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  }}>
    <Box sx={{
      width: 48, height: 48, borderRadius: 2,
      background: `${color}22`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {React.cloneElement(icon, { sx: { color, fontSize: 24 } })}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight="bold">{value}</Typography>
    </Box>
  </Paper>
);

const Perfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { isDark } = useThemeMode();

  const [comprasOpen, setComprasOpen] = useState(false);
  const [compras, setCompras] = useState([]);
  const [loadingCompras, setLoadingCompras] = useState(false);

  const [ventas, setVentas] = useState([]);
  const [loadingVentas, setLoadingVentas] = useState(false);

  const cargarPerfil = async () => {
    try {
      const response = await api.get('/users/perfil');
      setPerfil(response.data);
    } catch (err) {
      setError("No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const cargarCompras = async () => {
    setLoadingCompras(true);
    try {
      const response = await api.get('/pedidos/mis-compras');
      setCompras(response.data);
    } catch (err) { setCompras([]); }
    finally { setLoadingCompras(false); }
  };

  const cargarVentas = async () => {
    setLoadingVentas(true);
    try {
      const response = await api.get('/pedidos/mis-ventas');
      setVentas(response.data);
    } catch (err) { setVentas([]); }
    finally { setLoadingVentas(false); }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  useEffect(() => {
    if (perfil?.role === 'SELLER' || perfil?.role === 'ADMIN') {
      cargarVentas();
    }
  }, [perfil]);

  const handleAbrirCompras = () => { setComprasOpen(true); cargarCompras(); };

  const handleFotoClick = () => document.getElementById('input-foto').click();

  const handleCambiarFoto = async (event) => {
    const archivo = event.target.files[0];
    if (!archivo) return;
    if (!['image/jpeg', 'image/png'].includes(archivo.type)) { alert("Solo JPG o PNG"); return; }
    const formData = new FormData();
    formData.append('archivo', archivo);
    try {
      setSubiendo(true);
      const response = await api.post('/users/perfil/foto', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPerfil({ ...perfil, fotoUrl: response.data.url });
    } catch { alert("Error al actualizar la foto"); }
    finally { setSubiendo(false); }
  };

  const handleSolicitarVendedor = async () => {
    try {
      await api.post('/users/solicitar-vendedor');
      setSuccess('Solicitud enviada. Esperando aprobación del Administrador.');
      cargarPerfil();
      setTimeout(() => setSuccess(''), 5000);
    } catch { setError('Error al enviar la solicitud'); setTimeout(() => setError(''), 3000); }
  };

  const estadoColor = (estado) => {
    if (estado === 'PAGADO') return 'success';
    if (estado === 'PENDIENTE') return 'warning';
    if (estado === 'CANCELADO') return 'error';
    return 'default';
  };

  // Calcular estadísticas de ventas
  const ventasPagadas = ventas.filter(v => v.estado === 'PAGADO');
  const totalGanancias = ventasPagadas.reduce((acc, v) => acc + (v.montoVendedor || 0), 0);
  const totalVentas = ventasPagadas.length;
  const ventasPendientes = ventas.filter(v => v.estado === 'PENDIENTE').length;
  const promedioVenta = totalVentas > 0 ? totalGanancias / totalVentas : 0;

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error && !perfil) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;

  const esSeller = perfil?.role === 'SELLER' || perfil?.role === 'ADMIN';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* ── COLUMNA IZQUIERDA: info de perfil ── */}
        <Grid item xs={12} md={esSeller ? 6 : 12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <input accept="image/jpeg,image/png" id="input-foto" type="file" style={{ display: 'none' }} onChange={handleCambiarFoto} />
                  <IconButton onClick={handleFotoClick} disabled={subiendo} sx={{ p: 0, '&:hover .overlay': { opacity: 1 } }}>
                    <Avatar src={perfil?.fotoUrl} sx={{ width: 90, height: 90, fontSize: '2.5rem', bgcolor: 'primary.main' }}>
                      {!perfil?.fotoUrl && (perfil?.nombreMostrado?.charAt(0) || 'U')}
                    </Avatar>
                    <Box className="overlay" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }}>
                      <PhotoCamera sx={{ color: 'white' }} />
                    </Box>
                    {subiendo && <CircularProgress size={90} sx={{ position: 'absolute', top: 0, left: 0, color: 'primary.main', zIndex: 1 }} />}
                  </IconButton>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{perfil?.nombreMostrado || perfil?.username}</Typography>
                  <Typography variant="body2" color="text.secondary">@{perfil?.username}</Typography>
                  <Chip label={perfil?.role} color={perfil?.role === 'SELLER' ? 'success' : perfil?.role === 'ADMIN' ? 'error' : 'default'} size="small" sx={{ mt: 0.5 }} />
                </Box>
              </Box>
              <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => navigate('/editar-perfil')}>Editar</Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{perfil?.email}</Typography>
            </Box>

            {perfil?.descripcion ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Descripción</Typography>
                <Typography variant="body1">{perfil.descripcion}</Typography>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
                Agrega una descripción editando tu perfil.
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Botón mis compras */}
            <Button variant="outlined" color="primary" fullWidth startIcon={<ShoppingBagIcon />} onClick={handleAbrirCompras} sx={{ mb: 1.5, borderRadius: 2 }}>
              Mis Compras
            </Button>

            {/* Mis publicaciones */}
            {esSeller && (
              <Button variant="contained" fullWidth startIcon={<StorefrontIcon />} onClick={() => navigate('/mis-publicaciones')} sx={{ borderRadius: 2 }}>
                Mis Publicaciones
              </Button>
            )}

            {/* Solicitar vendedor */}
            {perfil?.role === 'USER' && !perfil?.solicitudVendedor && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 1.5 }}>¿Quieres vender? Solicita ser vendedor.</Alert>
                <Button variant="contained" fullWidth onClick={handleSolicitarVendedor} sx={{ borderRadius: 2 }}>Solicitar ser Vendedor</Button>
              </Box>
            )}
            {perfil?.solicitudVendedor && perfil?.role === 'USER' && (
              <Alert severity="warning" sx={{ mt: 2 }}>Tu solicitud está pendiente de aprobación.</Alert>
            )}
          </Paper>
        </Grid>

        {/* ── COLUMNA DERECHA: panel de ganancias (solo sellers) ── */}
        {esSeller && (
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold">Panel de Ganancias</Typography>
              </Box>

              {loadingVentas ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : (
                <>
                  {/* Stats cards */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <StatCard
                        icon={<AccountBalanceWalletIcon />}
                        label="Saldo disponible"
                        value={`$${Number(perfil?.saldoDisponible || 0).toFixed(2)}`}
                        color="#10b981"
                        isDark={isDark}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StatCard
                        icon={<AttachMoneyIcon />}
                        label="Total ganado"
                        value={`$${totalGanancias.toFixed(2)}`}
                        color="#6366f1"
                        isDark={isDark}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StatCard
                        icon={<ReceiptLongIcon />}
                        label="Ventas completadas"
                        value={totalVentas}
                        color="#f59e0b"
                        isDark={isDark}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StatCard
                        icon={<HourglassEmptyIcon />}
                        label="Pendientes"
                        value={ventasPendientes}
                        color="#ef4444"
                        isDark={isDark}
                      />
                    </Grid>
                  </Grid>

                  {totalVentas > 0 && (
                    <Box sx={{ p: 2, borderRadius: 2, background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)', border: '1px solid', borderColor: isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)', mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">Promedio por venta</Typography>
                      <Typography variant="h5" fontWeight="bold" color="primary.main">${promedioVenta.toFixed(2)}</Typography>
                    </Box>
                  )}

                  {/* Últimas ventas */}
                  <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Últimas ventas
                  </Typography>

                  {ventas.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <ReceiptLongIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">Aún no tienes ventas</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 260, overflowY: 'auto', pr: 0.5 }}>
                      {ventas.slice(0, 10).map((venta, i) => (
                        <React.Fragment key={venta.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={venta.producto?.urlPortada} variant="rounded" sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                                {venta.producto?.titulo?.charAt(0) || '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                  {venta.producto?.titulo || 'Producto'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {venta.cliente?.nombreMostrado || venta.cliente?.username || 'Cliente'} · {venta.fechaPedido ? new Date(venta.fechaPedido).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : ''}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                +${Number(venta.montoVendedor || 0).toFixed(2)}
                              </Typography>
                              <Chip label={venta.estado} color={estadoColor(venta.estado)} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                            </Box>
                          </Box>
                          {i < Math.min(ventas.length - 1, 9) && <Divider />}
                        </React.Fragment>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* ── MODAL MIS COMPRAS ── */}
      <Dialog open={comprasOpen} onClose={() => setComprasOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingBagIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">Mis Compras</Typography>
          </Box>
          <IconButton onClick={() => setComprasOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          {loadingCompras ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
          ) : compras.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ShoppingBagIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">Aún no has realizado ninguna compra</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {compras.map((pedido, index) => (
                <React.Fragment key={pedido.id}>
                  <ListItem sx={{ px: 3, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar src={pedido.producto?.urlArchivo || pedido.producto?.urlPortada} variant="rounded" sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: 'primary.main' }}>
                        {pedido.producto?.titulo?.charAt(0) || '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText sx={{ ml: 1.5 }}
                      primary={<Typography variant="subtitle2" fontWeight="bold">{pedido.producto?.titulo || 'Producto'}</Typography>}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">Vendedor: {pedido.producto?.vendedor?.nombreMostrado || 'N/A'}</Typography><br />
                          <Typography variant="caption" color="text.secondary">
                            {pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="success.main">${pedido.producto?.precio}</Typography>
                      <Chip icon={pedido.estado === 'PAGADO' ? <CheckCircleIcon /> : <HourglassEmptyIcon />} label={pedido.estado} color={estadoColor(pedido.estado)} size="small" />
                    </Box>
                  </ListItem>
                  {index < compras.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setComprasOpen(false)} variant="outlined" fullWidth sx={{ borderRadius: 2 }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Perfil;
