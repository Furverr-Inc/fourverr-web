import React, { useEffect, useState, useCallback } from 'react';
import {
  AppBar, Toolbar, Button, Box, IconButton, Avatar, Tooltip, Badge, Typography,
  Popover, List, ListItem, ListItemAvatar, ListItemText, Divider, Chip
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import WishlistDrawer from './WishlistDrawer';
import LanguageSwitcher from './LanguageSwitcher';

const estadoColor = (e) => e === 'PAGADO' ? 'success' : e === 'PENDIENTE' ? 'warning' : 'error';

const Navbar = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeMode();
  const { t } = useLanguage();
  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Usuario';
  const usuarioRol    = localStorage.getItem('usuarioRol');
  const [fotoUrl, setFotoUrl]             = useState(localStorage.getItem('usuarioFoto') || '');
  const [wishlistOpen, setWishlistOpen]   = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [ventas, setVentas]               = useState([]);
  const [notifAnchor, setNotifAnchor]     = useState(null);

  const ventasPendientes = ventas.filter(v => v.estado === 'PENDIENTE').length;

  const handleSolicitar = async () => {
    if (!window.confirm('¿Deseas enviar tu solicitud para ser vendedor?')) return;
    try {
      await api.post('/users/solicitar-vendedor');
      alert('✅ Solicitud enviada. Un administrador revisará tu perfil.');
    } catch { alert('Error al enviar solicitud o ya la enviaste.'); }
  };

  const checkStatus = useCallback(async () => {
    if (usuarioRol === 'USER') {
      try {
        const { data } = await api.get('/users/refresh-status');
        if (data.role === 'SELLER') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('usuarioRol', data.role);
          alert('¡Felicidades! Has sido aprobado como Vendedor.');
          window.location.reload();
        }
      } catch {}
    }
    try {
      const res = await api.get('/users/perfil');
      const nuevaFoto   = res.data.fotoUrl || '';
      const nuevoNombre = res.data.nombreMostrado || res.data.username || usuarioNombre;
      if (nuevaFoto !== fotoUrl) { setFotoUrl(nuevaFoto); localStorage.setItem('usuarioFoto', nuevaFoto); }
      localStorage.setItem('usuarioNombre', nuevoNombre);
    } catch {}
    try {
      const res = await api.get('/favoritos');
      setWishlistCount(res.data.length);
    } catch {}
    if (usuarioRol === 'SELLER' || usuarioRol === 'ADMIN') {
      try {
        const res = await api.get('/pedidos/mis-ventas');
        setVentas(res.data || []);
      } catch {}
    }
  }, [usuarioRol, fotoUrl, usuarioNombre]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };
  const iconSx = { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' };

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{
        background: isDark
          ? 'linear-gradient(90deg, rgba(10,10,20,0.97) 0%, rgba(20,10,40,0.97) 100%)'
          : 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.12)',
        boxShadow: isDark ? '0 2px 20px rgba(99,102,241,0.15)' : '0 2px 20px rgba(99,102,241,0.08)',
      }}>
        <Toolbar sx={{ minHeight: 64 }}>
          {/* LOGO */}
          <Box component={Link} to="/home" sx={{ flexGrow: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.5)', flexShrink: 0 }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1rem', lineHeight: 1 }}>Z</Typography>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.5px', background: isDark ? 'linear-gradient(90deg, #a5b4fc, #c4b5fd)' : 'linear-gradient(90deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
              Zento
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={isDark ? t.lightMode : t.darkMode}>
              <IconButton onClick={toggleTheme} sx={iconSx}>
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* ── Campana notificaciones (solo SELLER/ADMIN) ── */}
            {(usuarioRol === 'SELLER' || usuarioRol === 'ADMIN') && (
              <>
                <Tooltip title={ventasPendientes > 0 ? `${ventasPendientes} ${t.pending}` : t.noNotifications}>
                  <IconButton onClick={e => setNotifAnchor(e.currentTarget)} sx={iconSx}>
                    <Badge badgeContent={ventasPendientes} color="error" max={9}>
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Popover
                  open={Boolean(notifAnchor)}
                  anchorEl={notifAnchor}
                  onClose={() => setNotifAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{ sx: { width: 340, mt: 1, borderRadius: 3, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', overflow: 'hidden' } }}>
                  <Box sx={{ px: 2.5, py: 1.5, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white' }}>
                      🔔 {t.notifications}
                    </Typography>
                    {ventasPendientes > 0 && (
                      <Chip label={`${ventasPendientes} ${t.pending}`} size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }} />
                    )}
                  </Box>
                  {ventas.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">{t.noPendingNotif}</Typography>
                    </Box>
                  ) : (
                    <List disablePadding sx={{ maxHeight: 320, overflowY: 'auto' }}>
                      {ventas.slice(0, 8).map((v, i) => (
                        <React.Fragment key={v.id}>
                          <ListItem sx={{ px: 2, py: 1.2 }}>
                            <ListItemAvatar>
                              <Avatar src={v.producto?.urlPortada} variant="rounded"
                                sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                                {v.producto?.titulo?.charAt(0) || '?'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant="body2" fontWeight="bold" noWrap>{v.producto?.titulo || 'Producto'}</Typography>}
                              secondary={<Typography variant="caption" color="text.secondary">
                                {v.cliente?.nombreMostrado || v.cliente?.username || 'Cliente'} · {v.fechaPedido ? new Date(v.fechaPedido).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : ''}
                              </Typography>}
                            />
                            <Box sx={{ textAlign: 'right', ml: 1, flexShrink: 0 }}>
                              <Typography variant="body2" fontWeight="bold" color="success.main">+${Number(v.montoVendedor || 0).toFixed(0)}</Typography>
                              <Chip icon={v.estado === 'PAGADO' ? <CheckCircleIcon sx={{ fontSize: '11px !important' }} /> : <HourglassEmptyIcon sx={{ fontSize: '11px !important' }} />}
                                label={v.estado} color={estadoColor(v.estado)} size="small" sx={{ height: 18, fontSize: '0.6rem', mt: 0.3 }} />
                            </Box>
                          </ListItem>
                          {i < Math.min(ventas.length - 1, 7) && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                  <Divider />
                  <Box sx={{ p: 1.5 }}>
                    <Button fullWidth size="small" variant="text"
                      onClick={() => { setNotifAnchor(null); navigate('/perfil'); }}
                      sx={{ borderRadius: 2, color: 'primary.main', fontWeight: 'bold' }}>
                      {t.fullPanel}
                    </Button>
                  </Box>
                </Popover>
              </>
            )}

            {/* Wishlist */}
            <Tooltip title={t.wishlist}>
              <IconButton onClick={() => setWishlistOpen(true)} sx={iconSx}>
                <Badge badgeContent={wishlistCount} color="primary" max={99}>
                  <StarIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', mx: 0.5 }}>
              {t.hello}, {usuarioNombre}
            </Typography>

            <IconButton component={Link} to="/perfil" sx={{ p: 0.5 }}>
              {fotoUrl ? (
                <Avatar src={fotoUrl} alt={usuarioNombre} sx={{ width: 36, height: 36 }} />
              ) : (
                <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {usuarioNombre.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </IconButton>

            {usuarioRol === 'SELLER' || usuarioRol === 'ADMIN' ? (
              <Button variant="contained" component={Link} to="/nuevo" startIcon={<StorefrontIcon />}
                sx={{ fontWeight: 'bold', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)', '&:hover': { background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }, borderRadius: 2, px: 2 }}>
                {t.publishGig}
              </Button>
            ) : (
              <Button variant="outlined" onClick={handleSolicitar}
                sx={{ borderRadius: 2, borderColor: '#6366f1', color: '#6366f1', '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(99,102,241,0.05)' } }}>
                {t.beSeller}
              </Button>
            )}

            <Button onClick={handleLogout} sx={{ borderRadius: 2, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', '&:hover': { color: '#ef4444' } }}>
              {t.logout}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <WishlistDrawer open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <LanguageSwitcher />
    </>
  );
};

export default Navbar;
