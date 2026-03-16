import React, { useEffect, useState, useCallback } from 'react';
import {
  AppBar, Toolbar, Button, Box, IconButton, Avatar, Tooltip, Badge, Typography,
  Popover, List, ListItem, ListItemAvatar, ListItemText, Divider, Chip,
  Menu, MenuItem, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, Link } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Usuario';
  const usuarioRol    = localStorage.getItem('usuarioRol');

  const [fotoUrl, setFotoUrl]             = useState(localStorage.getItem('usuarioFoto') || '');
  const [wishlistOpen, setWishlistOpen]   = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [ventas, setVentas]               = useState([]);
  const [notifAnchor, setNotifAnchor]     = useState(null);

  // Menú de avatar en móvil
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
  const avatarMenuOpen = Boolean(avatarMenuAnchor);

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

  // ─── Avatar con iniciales o foto ───
  const AvatarUser = ({ size = 36 }) => (
    fotoUrl ? (
      <Avatar src={fotoUrl} alt={usuarioNombre} sx={{ width: size, height: size }} />
    ) : (
      <Avatar sx={{ width: size, height: size, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        {usuarioNombre.charAt(0).toUpperCase()}
      </Avatar>
    )
  );

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
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>

          {/* ── LOGO ── */}
          <Box component={Link} to="/home" sx={{
            flexGrow: 1, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 1
          }}>
            <Box sx={{
              width: { xs: 30, sm: 34 }, height: { xs: 30, sm: 34 },
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.5)', flexShrink: 0
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '1rem' }, lineHeight: 1 }}>
                Z
              </Typography>
            </Box>
            {/* Nombre "Zento" solo en desktop */}
            {!isMobile && (
              <Typography sx={{
                fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.5px',
                background: isDark
                  ? 'linear-gradient(90deg, #a5b4fc, #c4b5fd)'
                  : 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1
              }}>
                Zento
              </Typography>
            )}
          </Box>

          {/* ══════════════════════════════
              MÓVIL: solo iconos esenciales + avatar con menú
          ══════════════════════════════ */}
          {isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

              {/* Toggle dark/light */}
              <IconButton onClick={toggleTheme} sx={{ ...iconSx, p: 0.75 }}>
                {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>

              {/* Campana (solo SELLER/ADMIN) */}
              {(usuarioRol === 'SELLER' || usuarioRol === 'ADMIN') && (
                <IconButton onClick={e => setNotifAnchor(e.currentTarget)} sx={{ ...iconSx, p: 0.75 }}>
                  <Badge badgeContent={ventasPendientes} color="error" max={9}>
                    <NotificationsIcon fontSize="small" />
                  </Badge>
                </IconButton>
              )}

              {/* Wishlist */}
              <IconButton onClick={() => setWishlistOpen(true)} sx={{ ...iconSx, p: 0.75 }}>
                <Badge badgeContent={wishlistCount} color="primary" max={99}>
                  <StarIcon fontSize="small" />
                </Badge>
              </IconButton>

              {/* Avatar → abre menú desplegable */}
              <IconButton
                onClick={e => setAvatarMenuAnchor(e.currentTarget)}
                sx={{ p: 0.5 }}
              >
                <AvatarUser size={34} />
              </IconButton>

              {/* ── Menú del avatar en móvil ── */}
              <Menu
                anchorEl={avatarMenuAnchor}
                open={avatarMenuOpen}
                onClose={() => setAvatarMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    minWidth: 200,
                    mt: 1,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    overflow: 'visible',
                  }
                }}
              >
                {/* Header del menú con nombre de usuario */}
                <Box sx={{
                  px: 2, py: 1.5,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  borderBottom: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                }}>
                  <AvatarUser size={38} />
                  <Box>
                    <Typography variant="body2" fontWeight="bold" noWrap>
                      {usuarioNombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {usuarioRol?.toLowerCase()}
                    </Typography>
                  </Box>
                </Box>

                {/* Mi perfil */}
                <MenuItem
                  onClick={() => { navigate('/perfil'); setAvatarMenuAnchor(null); }}
                  sx={{ py: 1.2, gap: 1.5 }}
                >
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">mi perfil</Typography>
                </MenuItem>

                {/* Conviértete en vendedor / Publicar gig */}
                {(usuarioRol === 'SELLER' || usuarioRol === 'ADMIN') ? (
                  <MenuItem
                    onClick={() => { navigate('/nuevo'); setAvatarMenuAnchor(null); }}
                    sx={{ py: 1.2, gap: 1.5 }}
                  >
                    <StorefrontIcon fontSize="small" color="action" />
                    <Typography variant="body2">{t.publishGig}</Typography>
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={() => { handleSolicitar(); setAvatarMenuAnchor(null); }}
                    sx={{ py: 1.2, gap: 1.5 }}
                  >
                    <StorefrontIcon fontSize="small" color="action" />
                    <Typography variant="body2">conviértete en vendedor</Typography>
                  </MenuItem>
                )}

                <Divider />

                {/* Logout */}
                <MenuItem
                  onClick={handleLogout}
                  sx={{ py: 1.2, gap: 1.5, color: 'error.main' }}
                >
                  <LogoutIcon fontSize="small" />
                  <Typography variant="body2" fontWeight="bold">LOG OUT</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            /* ══════════════════════════════
                DESKTOP: barra completa como estaba
            ══════════════════════════════ */
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={isDark ? t.lightMode : t.darkMode}>
                <IconButton onClick={toggleTheme} sx={iconSx}>
                  {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              {/* Campana notificaciones (solo SELLER/ADMIN) */}
              {(usuarioRol === 'SELLER' || usuarioRol === 'ADMIN') && (
                <>
                  <Tooltip title={ventasPendientes > 0 ? `${ventasPendientes} ${t.pending}` : t.noNotifications}>
                    <IconButton onClick={e => setNotifAnchor(e.currentTarget)} sx={iconSx}>
                      <Badge badgeContent={ventasPendientes} color="error" max={9}>
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
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
                <AvatarUser size={36} />
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
          )}
        </Toolbar>
      </AppBar>

      {/* ── Popover de notificaciones (compartido desktop/móvil) ── */}
      {(usuarioRol === 'SELLER' || usuarioRol === 'ADMIN') && (
        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: { xs: 300, sm: 340 }, mt: 1, borderRadius: 3,
              border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)', overflow: 'hidden'
            }
          }}
        >
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
      )}

      <WishlistDrawer open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <LanguageSwitcher />
    </>
  );
};

export default Navbar;
