import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Box, Typography, Avatar, Button, IconButton,
  Badge, Menu, MenuItem, Divider, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress,
  Tabs, Tab, Checkbox, Toolbar, Grid, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StoreIcon from '@mui/icons-material/Store';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';
import SoporteAdmin from '../components/SoporteAdmin';

const InfoRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.8 }}>
      <Box sx={{ color: 'text.secondary', flexShrink: 0, mt: 0.1 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
          {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Box>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol   = localStorage.getItem('usuarioRol');
    if (!token || rol !== 'ADMIN') navigate('/', { replace: true });
  }, []);

  const [admin, setAdmin] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [selected, setSelected] = useState([]);
  // Dialog de detalle de usuario
  const [detalleDialog, setDetalleDialog] = useState({ open: false, usuario: null });
  const [retiros, setRetiros] = useState([]);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    const [perfilRes, solicitudesRes, usuariosRes, retirosRes] = await Promise.allSettled([
      api.get('/users/perfil'),
      api.get('/users/solicitudes-vendedor'),
      api.get('/users/todos'),
      api.get('/users/retiros'),
    ]);

    if (perfilRes.status === 'fulfilled') {
      setAdmin(perfilRes.value.data);
    } else {
      const status = perfilRes.reason?.response?.status;
      if (status === 401) { setError('Sesión expirada.'); setLoading(false); return; }
    }

    if (solicitudesRes.status === 'fulfilled') {
      setSolicitudes(Array.isArray(solicitudesRes.value.data) ? solicitudesRes.value.data : []);
    } else { setSolicitudes([]); }

    if (usuariosRes.status === 'fulfilled') {
      setUsuarios(Array.isArray(usuariosRes.value.data) ? usuariosRes.value.data : []);
    } else {
      const status = usuariosRes.reason?.response?.status;
      const msg    = usuariosRes.reason?.response?.data;
      if (status === 403) setError(`Backend rechazó la petición (403): "${msg}"`);
      else if (status === 401) setError('Sesión expirada.');
      else setError(`Error cargando usuarios (${status}): ${msg}`);
      setUsuarios([]);
    }

    if (retirosRes.status === 'fulfilled') {
      setRetiros(Array.isArray(retirosRes.value.data) ? retirosRes.value.data : []);
    } else { setRetiros([]); }

    setLoading(false);
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleAprobarSolicitud = async (userId) => {
    try {
      await api.put(`/users/${userId}/aprobar-vendedor`);
      setSuccess('✅ Solicitud aprobada.');
      setAnchorEl(null); cargarDatos();
      setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Error al aprobar la solicitud'); setTimeout(() => setError(''), 3000); }
  };

  const handleRechazarSolicitud = async (userId) => {
    try {
      await api.put(`/users/${userId}/rechazar-vendedor`);
      setSuccess('Solicitud rechazada');
      setAnchorEl(null); cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Error al rechazar la solicitud'); setTimeout(() => setError(''), 3000); }
  };

  const handleFotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) { setError('Solo imágenes'); return; }
    setSubiendoFoto(true);
    const formData = new FormData();
    formData.append('archivo', file);
    try {
      const response = await api.post('/users/perfil/foto', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAdmin({ ...admin, fotoUrl: response.data.url });
      setSuccess('Foto actualizada'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Error al subir la foto'); setTimeout(() => setError(''), 3000); }
    finally { setSubiendoFoto(false); }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) setSelected(usuariosMostrar.map(u => u.id));
    else setSelected([]);
  };

  const handleSelectOne = (userId) => {
    if (selected.includes(userId)) setSelected(selected.filter(id => id !== userId));
    else setSelected([...selected, userId]);
  };

  const handleHabilitarSeleccionados = async () => {
    try {
      await Promise.all(selected.map(userId => api.put(`/users/${userId}/habilitar`)));
      setSuccess(`✅ ${selected.length} usuario(s) habilitado(s)`);
      setSelected([]); cargarDatos(); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Error al habilitar'); setTimeout(() => setError(''), 3000); }
  };

  const handleDeshabilitarSeleccionados = async () => {
    try {
      await Promise.all(selected.map(userId => api.put(`/users/${userId}/deshabilitar`)));
      setSuccess(`⚠️ ${selected.length} usuario(s) deshabilitado(s)`);
      setSelected([]); cargarDatos(); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Error al deshabilitar'); setTimeout(() => setError(''), 3000); }
  };

  const handleEliminarSeleccionados = () => {
    const usuariosAEliminar = usuarios.filter(u => selected.includes(u.id));
    setDeleteDialog({ open: true, users: usuariosAEliminar });
  };

  const handleConfirmDelete = async () => {
    try {
      await Promise.all(deleteDialog.users.map(user => api.delete(`/users/${user.id}`)));
      setSuccess(`🗑️ ${deleteDialog.users.length} usuario(s) eliminado(s)`);
      setDeleteDialog({ open: false, users: [] });
      setSelected([]); cargarDatos(); setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar: ' + (err.response?.data || err.message));
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCompletarRetiro = async (id) => {
    try {
      await api.put(`/users/retiros/${id}/completar`);
      setSuccess('✅ Retiro marcado como completado');
      cargarDatos(); setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Error al completar retiro'); setTimeout(() => setError(''), 3000); }
  };

  const handleRechazarRetiro = async (id) => {
    try {
      await api.put(`/users/retiros/${id}/rechazar`);
      setSuccess('Retiro rechazado y saldo devuelto al vendedor');
      cargarDatos(); setTimeout(() => setSuccess(''), 4000);
    } catch { setError('Error al rechazar retiro'); setTimeout(() => setError(''), 3000); }
  };

  const usuariosPorRol = {
    todos:     usuarios,
    usuarios:  usuarios.filter(u => u.role === 'USER'),
    vendedores:usuarios.filter(u => u.role === 'SELLER'),
  };

  const retirosPendientes = retiros.filter(r => r.estado === 'PENDIENTE');

  const usuariosMostrar = tabValue === 0 ? usuariosPorRol.todos
                        : tabValue === 1 ? usuariosPorRol.usuarios
                        : tabValue === 2 ? usuariosPorRol.vendedores
                        : [];

  const isSelected = (userId) => selected.includes(userId);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar src={admin?.fotoUrl} sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: '#d32f2f' }}>
                {!admin?.fotoUrl && (admin?.nombreMostrado?.charAt(0) || 'A')}
              </Avatar>
              <input accept="image/*" style={{ display: 'none' }} id="foto-perfil-admin" type="file" onChange={handleFotoChange} />
              <label htmlFor="foto-perfil-admin">
                <IconButton component="span" disabled={subiendoFoto}
                  sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: '#1dbf73', color: 'white', '&:hover': { bgcolor: '#19a463' }, width: 32, height: 32 }}>
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </label>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">{admin?.nombreMostrado || admin?.username}</Typography>
              <Chip label="Administrador" color="error" size="small" sx={{ mt: 0.5 }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ color: solicitudes.length > 0 ? '#d32f2f' : '#1dbf73' }}>
              <Badge badgeContent={solicitudes.length} color="error">
                <NotificationsIcon fontSize="large" />
              </Badge>
            </IconButton>
            <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Box>
        </Box>
      </Paper>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* Tabla de Usuarios */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Gestión de Usuarios</Typography>
        <Divider sx={{ mb: 2 }} />

        <Tabs value={tabValue} onChange={(e, v) => { setTabValue(v); setSelected([]); }} sx={{ mb: 2 }}>
          <Tab label={`Todos (${usuariosPorRol.todos.length})`} />
          <Tab label={`Usuarios (${usuariosPorRol.usuarios.length})`} />
          <Tab label={`Vendedores (${usuariosPorRol.vendedores.length})`} />
          <Tab label={`Retiros (${retirosPendientes.length} pendientes)`}
            sx={{ color: retirosPendientes.length > 0 ? 'error.main' : 'inherit' }} />
        </Tabs>

        {selected.length > 0 && (
          <Toolbar sx={{ bgcolor: 'rgba(29,191,115,0.1)', borderRadius: 1, mb: 2, border: '2px solid #1dbf73' }}>
            <Typography sx={{ flex: '1 1 100%' }} variant="subtitle1" fontWeight="bold">
              {selected.length} seleccionado(s)
            </Typography>
            <Button variant="contained" startIcon={<CheckBoxIcon />} onClick={handleHabilitarSeleccionados}
              sx={{ mr: 1, bgcolor: '#1dbf73', '&:hover': { bgcolor: '#19a463' } }}>Habilitar</Button>
            <Button variant="contained" startIcon={<BlockIcon />} onClick={handleDeshabilitarSeleccionados}
              color="warning" sx={{ mr: 1 }}>Deshabilitar</Button>
            <Button variant="contained" startIcon={<DeleteIcon />} onClick={handleEliminarSeleccionados} color="error">
              Eliminar
            </Button>
          </Toolbar>
        )}

        {tabValue === 3 ? (
          /* ── TAB RETIROS ── */
          retiros.length === 0 ? (
            <Alert severity="info">No hay solicitudes de retiro</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Vendedor</strong></TableCell>
                    <TableCell><strong>Monto</strong></TableCell>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {retiros.map(r => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {r.vendedor?.nombreMostrado || r.vendedor?.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{r.vendedor?.username}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ${Number(r.monto).toFixed(2)} MXN
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(r.fechaSolicitud).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.estado}
                          color={r.estado === 'COMPLETADO' ? 'success' : r.estado === 'RECHAZADO' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {r.estado === 'PENDIENTE' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="contained" color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleCompletarRetiro(r.id)}>
                              Completar
                            </Button>
                            <Button size="small" variant="outlined" color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => handleRechazarRetiro(r.id)}>
                              Rechazar
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : usuariosMostrar.length === 0 ? (
          <Alert severity="info">No hay usuarios en esta categoría</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < usuariosMostrar.length}
                      checked={usuariosMostrar.length > 0 && selected.length === usuariosMostrar.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell><strong>Foto</strong></TableCell>
                  <TableCell><strong>Nombre / Usuario</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Rol</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuariosMostrar.map((usuario) => {
                  const isItemSelected = isSelected(usuario.id);
                  return (
                    <TableRow key={usuario.id} hover
                      onClick={() => handleSelectOne(usuario.id)}
                      selected={isItemSelected} sx={{ cursor: 'pointer' }}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver perfil completo">
                          <Avatar src={usuario.fotoUrl}
                            onClick={(e) => { e.stopPropagation(); setDetalleDialog({ open: true, usuario }); }}
                            sx={{ width: 40, height: 40, bgcolor: '#1dbf73', cursor: 'pointer',
                              '&:hover': { outline: '2px solid #1dbf73', outlineOffset: 2 } }}>
                            {!usuario.fotoUrl && (usuario.nombreMostrado?.charAt(0) || usuario.username?.charAt(0))}
                          </Avatar>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {usuario.nombreMostrado || usuario.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">@{usuario.username}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{usuario.email}</Typography>
                        {usuario.telefono && (
                          <Typography variant="caption" color="text.secondary">{usuario.telefono}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={usuario.role === 'SELLER' ? 'Vendedor' : 'Usuario'}
                          color={usuario.role === 'SELLER' ? 'primary' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={usuario.habilitado ? 'Habilitado' : 'Deshabilitado'}
                          color={usuario.habilitado ? 'success' : 'error'} size="small" />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" color="info"
                              onClick={() => setDetalleDialog({ open: true, usuario })}>
                              <PersonIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {usuario.habilitado ? (
                            <Tooltip title="Deshabilitar">
                              <IconButton size="small" color="warning"
                                onClick={async () => { await api.put(`/users/${usuario.id}/deshabilitar`); cargarDatos(); setSuccess('Usuario deshabilitado'); setTimeout(() => setSuccess(''), 3000); }}>
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Habilitar">
                              <IconButton size="small" color="success"
                                onClick={async () => { await api.put(`/users/${usuario.id}/habilitar`); cargarDatos(); setSuccess('Usuario habilitado'); setTimeout(() => setSuccess(''), 3000); }}>
                                <CheckBoxIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Eliminar usuario">
                            <IconButton size="small" color="error"
                              onClick={() => setDeleteDialog({ open: true, users: [usuario] })}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Panel de Soporte */}
      <SoporteAdmin />

      {/* ── MENU NOTIFICACIONES ── */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 400, maxHeight: 500 } }}>
        <MenuItem disabled>
          <Typography variant="h6" fontWeight="bold">🔔 Solicitudes de Vendedor ({solicitudes.length})</Typography>
        </MenuItem>
        <Divider />
        {solicitudes.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">No hay solicitudes pendientes</Typography>
          </MenuItem>
        ) : solicitudes.map(s => (
          <Box key={s.id} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="body1" fontWeight="bold">{s.nombreMostrado || s.username}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>@{s.username} — {s.email}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />}
                onClick={() => handleAprobarSolicitud(s.id)} sx={{ flex: 1 }}>Aprobar</Button>
              <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
                onClick={() => handleRechazarSolicitud(s.id)} sx={{ flex: 1 }}>Rechazar</Button>
            </Box>
          </Box>
        ))}
      </Menu>

      {/* ── DIALOG DETALLE USUARIO ── */}
      <Dialog open={detalleDialog.open} onClose={() => setDetalleDialog({ open: false, usuario: null })}
        maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {detalleDialog.usuario && (() => {
          const u = detalleDialog.usuario;
          return (
            <>
              {/* Header con gradiente */}
              <Box sx={{
                background: u.role === 'SELLER'
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                p: 3, pb: 2,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={u.fotoUrl}
                      sx={{ width: 72, height: 72, fontSize: '1.8rem', border: '3px solid rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.2)' }}>
                      {!u.fotoUrl && (u.nombreMostrado?.charAt(0) || u.username?.charAt(0))}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                        {u.nombreMostrado || u.username}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        @{u.username}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.8, flexWrap: 'wrap' }}>
                        <Chip label={u.role === 'SELLER' ? 'Vendedor' : 'Usuario'} size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} />
                        <Chip label={u.habilitado ? '✓ Habilitado' : '✗ Deshabilitado'} size="small"
                          sx={{ bgcolor: u.habilitado ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)', color: 'white' }} />
                        {u.solicitudVendedor && (
                          <Chip label="⏳ Solicitud pendiente" size="small"
                            sx={{ bgcolor: 'rgba(245,158,11,0.3)', color: 'white' }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <IconButton onClick={() => setDetalleDialog({ open: false, usuario: null })} sx={{ color: 'white' }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>

              <DialogContent sx={{ p: 0 }}>
                <Grid container>
                  {/* Columna izquierda */}
                  <Grid item xs={12} md={6} sx={{ p: 3, borderRight: { md: '1px solid' }, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold"
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
                      Información de Contacto
                    </Typography>
                    <InfoRow icon={<EmailIcon fontSize="small" />} label="Email" value={u.email} />
                    <InfoRow icon={<PhoneIcon fontSize="small" />} label="Teléfono" value={u.telefono} />
                    <InfoRow icon={<LocationOnIcon fontSize="small" />} label="Ubicación"
                      value={[u.ciudad, u.pais].filter(Boolean).join(', ') || null} />
                    <InfoRow icon={<LanguageIcon fontSize="small" />} label="Sitio web" value={u.sitioWeb} />

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold"
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
                      Redes Sociales
                    </Typography>
                    {u.instagram && (
                      <InfoRow icon={<InstagramIcon fontSize="small" sx={{ color: '#E1306C' }} />}
                        label="Instagram" value={`@${u.instagram}`} />
                    )}
                    {u.twitter && (
                      <InfoRow icon={<TwitterIcon fontSize="small" sx={{ color: '#1DA1F2' }} />}
                        label="Twitter / X" value={`@${u.twitter}`} />
                    )}
                    {u.linkedin && (
                      <InfoRow icon={<LinkedInIcon fontSize="small" sx={{ color: '#0A66C2' }} />}
                        label="LinkedIn" value={u.linkedin} />
                    )}
                    {!u.instagram && !u.twitter && !u.linkedin && (
                      <Typography variant="body2" color="text.disabled">Sin redes sociales registradas</Typography>
                    )}
                  </Grid>

                  {/* Columna derecha */}
                  <Grid item xs={12} md={6} sx={{ p: 3 }}>
                    {u.role === 'SELLER' && (
                      <>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold"
                          sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
                          Información de Vendedor
                        </Typography>
                        <Paper elevation={0} sx={{
                          p: 2, borderRadius: 2, mb: 2,
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
                          border: '1px solid rgba(99,102,241,0.2)',
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <AttachMoneyIcon sx={{ color: '#10b981', fontSize: 20 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              Saldo disponible
                            </Typography>
                          </Box>
                          <Typography variant="h5" fontWeight="bold" color="success.main">
                            ${Number(u.saldoDisponible || 0).toFixed(2)}
                          </Typography>
                        </Paper>
                        <InfoRow icon={<StoreIcon fontSize="small" />} label="Estado de solicitud"
                          value={u.solicitudVendedor ? 'Solicitud de vendedor pendiente' : null} />
                        <Divider sx={{ my: 2 }} />
                      </>
                    )}

                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold"
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
                      Descripción / Bio
                    </Typography>
                    {u.descripcion ? (
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {u.descripcion}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">Sin descripción</Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold"
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
                      Acciones Rápidas
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {u.habilitado ? (
                        <Button fullWidth variant="outlined" color="warning" startIcon={<BlockIcon />}
                          onClick={async () => {
                            await api.put(`/users/${u.id}/deshabilitar`);
                            cargarDatos();
                            setDetalleDialog({ open: false, usuario: null });
                            setSuccess('Usuario deshabilitado'); setTimeout(() => setSuccess(''), 3000);
                          }}>
                          Deshabilitar usuario
                        </Button>
                      ) : (
                        <Button fullWidth variant="outlined" color="success" startIcon={<CheckBoxIcon />}
                          onClick={async () => {
                            await api.put(`/users/${u.id}/habilitar`);
                            cargarDatos();
                            setDetalleDialog({ open: false, usuario: null });
                            setSuccess('Usuario habilitado'); setTimeout(() => setSuccess(''), 3000);
                          }}>
                          Habilitar usuario
                        </Button>
                      )}
                      <Button fullWidth variant="outlined" color="error" startIcon={<DeleteIcon />}
                        onClick={() => {
                          setDetalleDialog({ open: false, usuario: null });
                          setDeleteDialog({ open: true, users: [u] });
                        }}>
                        Eliminar usuario
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
            </>
          );
        })()}
      </Dialog>

      {/* ── DIALOG CONFIRMAR ELIMINAR ── */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, users: [] })}>
        <DialogTitle> ¿Estás seguro?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta acción eliminará <strong>permanentemente</strong> {deleteDialog.users.length} usuario(s):
            {deleteDialog.users.map(u => (
              <Box key={u.id} sx={{ mt: 1, ml: 2 }}>
                • <strong>@{u.username}</strong> ({u.email})
              </Box>
            ))}
            <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
              <Typography variant="body2" color="error" fontWeight="bold">
                 Se eliminarán también sus publicaciones, pedidos, reseñas y mensajes. Esta acción NO se puede deshacer.
              </Typography>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, users: [] })} variant="outlined">Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Sí, Eliminar {deleteDialog.users.length} Usuario(s)
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
