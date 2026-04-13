import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Paper, Box, Typography, Avatar, Button, IconButton,
  Badge, Menu, MenuItem, Divider, Tabs, Tab, Tooltip, Chip, CircularProgress,
} from '@mui/material';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import FlagIcon from '@mui/icons-material/Flag';
import api from '../../services/api';
import { useThemeMode } from '../../ThemeContext';
import { useLanguage } from '../../LanguageContext';
import { BRAND_NAVY, BRAND_PERIW } from '../../brandColors';

const countPendientes = (reportes) =>
  (Array.isArray(reportes) ? reportes : []).filter((r) => r.estado === 'PENDIENTE').length;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeMode();
  const { t } = useLanguage();

  const themeToggleSx = {
    color: isDark ? 'rgba(232,233,240,0.65)' : `${BRAND_NAVY}99`,
    '&:hover': { color: BRAND_PERIW },
  };

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('usuarioRol');
    if (!token || rol !== 'ADMIN') navigate('/', { replace: true });
  }, [navigate]);

  const cargarCabecera = useCallback(async () => {
    const [perfilRes, solRes, repRes] = await Promise.allSettled([
      api.get('/users/perfil'),
      api.get('/users/solicitudes-vendedor'),
      api.get('/reportes/admin'),
    ]);
    if (perfilRes.status === 'fulfilled') setAdmin(perfilRes.value.data);
    else if (perfilRes.reason?.response?.status === 401) {
      setLoading(false);
      return;
    }
    setSolicitudes(
      solRes.status === 'fulfilled' && Array.isArray(solRes.value.data) ? solRes.value.data : [],
    );
    setReportes(
      repRes.status === 'fulfilled' && Array.isArray(repRes.value.data) ? repRes.value.data : [],
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarCabecera();
    const interval = setInterval(cargarCabecera, 30000);
    return () => clearInterval(interval);
  }, [cargarCabecera]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAprobarSolicitud = async (userId) => {
    try {
      await api.put(`/users/${userId}/aprobar-vendedor`);
      setAnchorEl(null);
      cargarCabecera();
    } catch {
      /* snack en página hija si hace falta */
    }
  };

  const handleRechazarSolicitud = async (userId) => {
    try {
      await api.put(`/users/${userId}/rechazar-vendedor`);
      setAnchorEl(null);
      cargarCabecera();
    } catch {
      /* */
    }
  };

  const handleFotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setSubiendoFoto(true);
    const fd = new FormData();
    fd.append('archivo', file);
    try {
      const r = await api.post('/users/perfil/foto', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAdmin((a) => ({ ...a, fotoUrl: r.data.url }));
    } finally {
      setSubiendoFoto(false);
    }
  };

  const pendientesReportes = countPendientes(reportes);
  const badgeCount = solicitudes.length + pendientesReportes;

  const tabIndex =
    location.pathname.includes('/admin/soporte') ? 1
    : location.pathname.includes('/admin/reportes') ? 2
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar src={admin?.fotoUrl} sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: '#d32f2f' }}>
                {!admin?.fotoUrl && (admin?.nombreMostrado?.charAt(0) || 'A')}
              </Avatar>
              <input accept="image/*" style={{ display: 'none' }} id="foto-admin" type="file" onChange={handleFotoChange} />
              <label htmlFor="foto-admin">
                <IconButton
                  component="span"
                  disabled={subiendoFoto}
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    bgcolor: '#1dbf73',
                    color: 'white',
                    '&:hover': { bgcolor: '#19a463' },
                    width: 32,
                    height: 32,
                  }}
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </label>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {admin?.nombreMostrado || admin?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                (Administrador)
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title={isDark ? t.lightMode : t.darkMode}>
              <IconButton onClick={toggleTheme} sx={themeToggleSx} aria-label={isDark ? t.lightMode : t.darkMode}>
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={`${solicitudes.length} solicitud(es) · ${pendientesReportes} reporte(s) pendiente(s)`}>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ color: solicitudes.length > 0 || pendientesReportes > 0 ? '#d32f2f' : '#1dbf73' }}
              >
                <Badge badgeContent={badgeCount} color="error">
                  <NotificationsNoneOutlinedIcon fontSize="large" />
                </Badge>
              </IconButton>
            </Tooltip>
            <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Box>
        </Box>

        <Tabs
          value={tabIndex}
          onChange={(_, v) => {
            const paths = ['/admin/usuarios', '/admin/soporte', '/admin/reportes'];
            navigate(paths[v]);
          }}
          sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 1 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PeopleOutlineIcon />} iconPosition="start" label="Usuarios" />
          <Tab icon={<SupportAgentIcon />} iconPosition="start" label="Soporte" />
          <Tab
            icon={<FlagIcon />}
            iconPosition="start"
            label={
              <Badge badgeContent={pendientesReportes} color="error" invisible={pendientesReportes === 0} sx={{ pr: pendientesReportes ? 2 : 0 }}>
                Reportes
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      <Outlet />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { width: 400, maxHeight: 500 } }}>
        <MenuItem disabled sx={{ opacity: '1 !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsNoneOutlinedIcon fontSize="small" color="action" />
            <Typography variant="h6" fontWeight="bold">
              Solicitudes de vendedor ({solicitudes.length})
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        {solicitudes.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No hay solicitudes pendientes
            </Typography>
          </MenuItem>
        ) : (
          solicitudes.map((s) => (
            <Box key={s.id} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body1" fontWeight="bold">
                {s.nombreMostrado || s.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                @{s.username} — {s.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleAprobarSolicitud(s.id)}
                  sx={{ flex: 1 }}
                >
                  Aprobar
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleRechazarSolicitud(s.id)}
                  sx={{ flex: 1 }}
                >
                  Rechazar
                </Button>
              </Box>
            </Box>
          ))
        )}
        <Divider sx={{ my: 1 }} />
        <MenuItem component={Link} to="/admin/reportes" onClick={() => setAnchorEl(null)}>
          <FlagIcon fontSize="small" sx={{ mr: 1 }} color="error" />
          Ver panel de reportes
          {pendientesReportes > 0 && (
            <Chip size="small" label={pendientesReportes} color="error" sx={{ ml: 1 }} />
          )}
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default AdminLayout;
