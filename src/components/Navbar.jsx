import React, { useEffect, useState, useCallback } from 'react';
import {
  AppBar, Toolbar, Button, Box, IconButton, Avatar, Tooltip, Badge, Typography,
  Popover, List, ListItem, ListItemAvatar, ListItemText, Divider, Chip,
  Menu, MenuItem, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, Link } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import api from '../services/api';
import { clearAuthLocalStorage } from '../utils/authLocalStorage';
import { countUnreadMisReportes } from '../utils/misReportesNotif';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import WishlistDrawer from './WishlistDrawer';
import LanguageSwitcher from './LanguageSwitcher';
import {
  BRAND_NAVY, BRAND_NAVY_TOP, BRAND_PERIW, BRAND_PERIW_HOVER, BRAND_TEXT, BRAND_BORDER, BRAND_SHADOW,
} from '../brandColors';

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
  const [reportesUnread, setReportesUnread] = useState(0);

  // Menú de avatar en móvil
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
  const avatarMenuOpen = Boolean(avatarMenuAnchor);

  const ventasPendientes = ventas.filter(v => v.estado === 'PENDIENTE').length;

  const refreshWishlistCount = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await api.get('/favoritos');
      setWishlistCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch {
      setWishlistCount(0);
    }
  }, []);

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
    await refreshWishlistCount();
    if (usuarioRol === 'SELLER' || usuarioRol === 'ADMIN') {
      try {
        const res = await api.get('/pedidos/mis-ventas');
        setVentas(res.data || []);
      } catch {}
    }
    if (usuarioRol === 'USER' || usuarioRol === 'SELLER') {
      try {
        const res = await api.get('/reportes/mis-reportes');
        setReportesUnread(countUnreadMisReportes(Array.isArray(res.data) ? res.data : []));
      } catch {
        setReportesUnread(0);
      }
    } else {
      setReportesUnread(0);
    }
  }, [usuarioRol, fotoUrl, usuarioNombre, refreshWishlistCount]);

  useEffect(() => {
    const onRep = () => checkStatus();
    window.addEventListener('zento-reportes-actualizado', onRep);
    return () => window.removeEventListener('zento-reportes-actualizado', onRep);
  }, [checkStatus]);

  useEffect(() => {
    const onFav = () => refreshWishlistCount();
    window.addEventListener('zento-favoritos-cambiados', onFav);
    return () => window.removeEventListener('zento-favoritos-cambiados', onFav);
  }, [refreshWishlistCount]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { clearAuthLocalStorage(); navigate('/'); };
  const iconSx = {
    color: isDark ? 'rgba(232,233,240,0.65)' : `${BRAND_NAVY}99`,
    '&:hover': { color: BRAND_PERIW },
  };

  // ─── Avatar con iniciales o foto ───
  const AvatarUser = ({ size = 36 }) => (
    fotoUrl ? (
      <Avatar
        src={fotoUrl}
        alt={usuarioNombre}
        sx={{ width: size, height: size, border: `2px solid ${BRAND_BORDER}` }}
      />
    ) : (
      <Avatar sx={{
        width: size, height: size,
        background: `linear-gradient(145deg, ${BRAND_NAVY_TOP} 0%, ${BRAND_NAVY} 100%)`,
        color: BRAND_PERIW,
        fontWeight: 700,
        border: `1px solid ${BRAND_BORDER}`,
      }}>
        {usuarioNombre.charAt(0).toUpperCase()}
      </Avatar>
    )
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{
        background: isDark
          ? `linear-gradient(90deg, ${BRAND_NAVY}f5 0%, ${BRAND_NAVY_TOP}ee 100%)`
          : 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${BRAND_BORDER}`,
        boxShadow: `0 2px 20px ${BRAND_SHADOW}`,
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
              background: `linear-gradient(145deg, ${BRAND_NAVY_TOP} 0%, ${BRAND_NAVY} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 16px ${BRAND_SHADOW}`, flexShrink: 0,
              border: `1px solid ${BRAND_BORDER}`,
            }}>
              <Typography sx={{ color: BRAND_PERIW, fontWeight: 900, fontSize: { xs: '0.85rem', sm: '1rem' }, lineHeight: 1 }}>
                Z
              </Typography>
            </Box>
            {/* Nombre "Zento" solo en desktop */}
            {!isMobile && (
              <Typography sx={{
                fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.5px',
                color: isDark ? BRAND_TEXT : BRAND_NAVY,
                lineHeight: 1,
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
                    <NotificationsNoneOutlinedIcon fontSize="small" />
                  </Badge>
                </IconButton>
              )}

              {/* Wishlist */}
              <IconButton onClick={() => setWishlistOpen(true)} sx={{ ...iconSx, p: 0.75 }}>
                <Badge badgeContent={wishlistCount} sx={{ '& .MuiBadge-badge': { bgcolor: BRAND_PERIW, color: '#fff' } }} max={99}>
                  <StarBorderIcon fontSize="small" />
                </Badge>
              </IconButton>

              {(usuarioRol === 'USER' || usuarioRol === 'SELLER') && (
                <Tooltip title={t.myReportsTooltip}>
                  <IconButton component={Link} to="/perfil#mis-reportes" sx={{ ...iconSx, p: 0.75 }}>
                    <Badge badgeContent={reportesUnread} color="error" max={9} invisible={reportesUnread === 0}>
                      <FlagOutlinedIcon fontSize="small" />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

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

                {(usuarioRol === 'USER' || usuarioRol === 'SELLER') && (
                  <MenuItem
                    onClick={() => { navigate('/perfil#mis-reportes'); setAvatarMenuAnchor(null); }}
                    sx={{ py: 1.2, gap: 1.5 }}
                  >
                    <Badge badgeContent={reportesUnread} color="error" max={9} invisible={reportesUnread === 0}>
                      <FlagOutlinedIcon fontSize="small" color="action" />
                    </Badge>
                    <Typography variant="body2">{t.myReportsNav}</Typography>
                  </MenuItem>
                )}

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
                    <Typography variant="body2">{t.beSeller}</Typography>
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
                        <NotificationsNoneOutlinedIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </>
              )}

              {/* Wishlist */}
              <Tooltip title={t.wishlist}>
                <IconButton onClick={() => setWishlistOpen(true)} sx={iconSx}>
                <Badge badgeContent={wishlistCount} sx={{ '& .MuiBadge-badge': { bgcolor: BRAND_PERIW, color: '#fff' } }} max={99}>
                  <StarBorderIcon />
                </Badge>
                </IconButton>
              </Tooltip>

              {(usuarioRol === 'USER' || usuarioRol === 'SELLER') && (
                <Tooltip title={t.myReportsTooltip}>
                  <IconButton component={Link} to="/perfil#mis-reportes" sx={iconSx}>
                    <Badge badgeContent={reportesUnread} color="error" max={9} invisible={reportesUnread === 0}>
                      <FlagOutlinedIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              <Typography variant="body2" sx={{ color: isDark ? 'rgba(232,233,240,0.55)' : `${BRAND_NAVY}aa`, mx: 0.5 }}>
                {t.hello}, {usuarioNombre}
              </Typography>

              <IconButton component={Link} to="/perfil" sx={{ p: 0.5 }}>
                <AvatarUser size={36} />
              </IconButton>

              {usuarioRol === 'SELLER' || usuarioRol === 'ADMIN' ? (
                <Button variant="contained" component={Link} to="/nuevo" startIcon={<StorefrontIcon />}
                  sx={{
                    fontWeight: 'bold', borderRadius: '50px', px: 2,
                    bgcolor: BRAND_PERIW, color: '#fff',
                    boxShadow: `0 4px 14px ${BRAND_SHADOW}`,
                    '&:hover': { bgcolor: BRAND_PERIW_HOVER },
                  }}>
                  {t.publishGig}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={handleSolicitar}
                  sx={{
                    fontWeight: 'bold',
                    borderRadius: '50px',
                    px: 2,
                    borderColor: BRAND_PERIW,
                    ...(isDark
                      ? {
                          color: BRAND_TEXT,
                          '&:hover': {
                            borderColor: BRAND_PERIW_HOVER,
                            bgcolor: 'rgba(139,143,200,0.14)',
                            color: '#fff',
                          },
                        }
                      : {
                          color: BRAND_NAVY,
                          '&:hover': {
                            borderColor: BRAND_PERIW_HOVER,
                            bgcolor: 'rgba(139,143,200,0.08)',
                          },
                        }),
                  }}
                >
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
          <Box sx={{
            px: 2.5, py: 1.5,
            background: `linear-gradient(90deg, ${BRAND_NAVY_TOP} 0%, ${BRAND_NAVY} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${BRAND_BORDER}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 20, color: 'white' }} />
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white' }}>
                {t.notifications}
              </Typography>
            </Box>
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
              sx={{ borderRadius: 2, color: BRAND_PERIW, fontWeight: 'bold', '&:hover': { bgcolor: 'rgba(139,143,200,0.08)' } }}>
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
