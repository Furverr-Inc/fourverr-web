import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Paper, Box, Typography, Avatar, Button, IconButton,
  Badge, Menu, MenuItem, Divider, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress,
  Tabs, Tab, Checkbox, Toolbar, Stack, TextField, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon        from '@mui/icons-material/Logout';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import CancelIcon        from '@mui/icons-material/Cancel';
import BlockIcon         from '@mui/icons-material/Block';
import DeleteIcon        from '@mui/icons-material/Delete';
import PhotoCamera       from '@mui/icons-material/PhotoCamera';
import CheckBoxIcon      from '@mui/icons-material/CheckBox';
import FlagIcon          from '@mui/icons-material/Flag';
import ReplyIcon         from '@mui/icons-material/Reply';
import VisibilityIcon    from '@mui/icons-material/Visibility';
import RefreshIcon       from '@mui/icons-material/Refresh';
import api from '../services/api';
import SoporteAdmin from '../components/SoporteAdmin';

/* ─────────────────────────────────────────────────────────────────
   CONSTANTES DE REPORTES
───────────────────────────────────────────────────────────────── */
const ESTADO_CONFIG = {
  PENDIENTE:   { label: 'Pendiente',   color: 'warning' },
  EN_REVISION: { label: 'En revisión', color: 'info'    },
  RESUELTO:    { label: 'Resuelto',    color: 'success' },
  RECHAZADO:   { label: 'Rechazado',  color: 'default' },
};
const MOTIVO_LABEL = {
  FRAUDE:                '🔴 Fraude o estafa',
  CONTENIDO_INAPROPIADO: '🚫 Contenido inapropiado',
  SPAM:                  '📢 Spam o publicidad engañosa',
  PRODUCTO_FALSO:        '📦 Producto falso o inexistente',
  MAL_COMPORTAMIENTO:    '😠 Mal comportamiento',
  PRECIO_ENGAÑOSO:       '💸 Precio engañoso',
  OTRO:                  '❓ Otro motivo',
};
const fmtDate = (d) => d
  ? new Date(d).toLocaleString('es-MX', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
  : '—';

/* ─────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol   = localStorage.getItem('usuarioRol');
    if (!token || rol !== 'ADMIN') navigate('/', { replace: true });
  }, []);

  /* ── estado usuarios ── */
  const [admin,       setAdmin]       = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [usuarios,    setUsuarios]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [anchorEl,    setAnchorEl]    = useState(null);
  const [deleteDialog,setDeleteDialog]= useState({ open: false, users: [] });
  const [success,     setSuccess]     = useState('');
  const [error,       setError]       = useState('');
  const [tabValue,    setTabValue]    = useState(0);
  const [subiendoFoto,setSubiendoFoto]= useState(false);
  const [selected,    setSelected]    = useState([]);

  /* ── estado reportes ── */
  const [reportes,        setReportes]        = useState([]);
  const [loadingReportes, setLoadingReportes] = useState(true);
  const [tabReportes,     setTabReportes]     = useState(0);
  const [responderDlg,    setResponderDlg]    = useState({ open: false, reporte: null });
  const [detalleRDlg,     setDetalleRDlg]     = useState({ open: false, reporte: null });
  const [respuesta,       setRespuesta]       = useState('');
  const [enviandoR,       setEnviandoR]       = useState(false);
  const [successR,        setSuccessR]        = useState('');
  const [errorR,          setErrorR]          = useState('');

  /* ── carga datos usuarios ── */
  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    const [perfilRes, solRes, usrRes] = await Promise.allSettled([
      api.get('/users/perfil'),
      api.get('/users/solicitudes-vendedor'),
      api.get('/users/todos'),
    ]);
    if (perfilRes.status === 'fulfilled') setAdmin(perfilRes.value.data);
    else if (perfilRes.reason?.response?.status === 401) { setError('Sesión expirada.'); setLoading(false); return; }
    setSolicitudes(solRes.status === 'fulfilled' && Array.isArray(solRes.value.data) ? solRes.value.data : []);
    if (usrRes.status === 'fulfilled') setUsuarios(Array.isArray(usrRes.value.data) ? usrRes.value.data : []);
    else {
      const s = usrRes.reason?.response?.status;
      const m = usrRes.reason?.response?.data;
      setError(s === 403 ? `Backend rechazó (403): "${m}"` : `Error usuarios (${s}): ${m}`);
      setUsuarios([]);
    }
    setLoading(false);
  };

  /* ── carga reportes ── */
  const cargarReportes = useCallback(async () => {
    setLoadingReportes(true);
    try {
      const res = await api.get('/reportes/admin');
      setReportes(Array.isArray(res.data) ? res.data : []);
      setErrorR('');
    } catch (err) {
      setErrorR('Error al cargar reportes: ' + (err.response?.data || err.message));
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  useEffect(() => { cargarReportes(); }, [cargarReportes]);

  /* ── helpers ── */
  const mostrarR = (msg, tipo = 'success') => {
    if (tipo === 'error') { setErrorR(msg); setTimeout(() => setErrorR(''), 4000); }
    else { setSuccessR(msg); setTimeout(() => setSuccessR(''), 3500); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleAprobarSolicitud = async (userId) => {
    try { await api.put(`/users/${userId}/aprobar-vendedor`); setSuccess('✅ Solicitud aprobada.'); setAnchorEl(null); cargarDatos(); setTimeout(() => setSuccess(''), 4000); }
    catch { setError('Error al aprobar'); setTimeout(() => setError(''), 3000); }
  };
  const handleRechazarSolicitud = async (userId) => {
    try { await api.put(`/users/${userId}/rechazar-vendedor`); setSuccess('Solicitud rechazada'); setAnchorEl(null); cargarDatos(); setTimeout(() => setSuccess(''), 3000); }
    catch { setError('Error al rechazar'); setTimeout(() => setError(''), 3000); }
  };

  const handleFotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) { setError('Solo imágenes'); return; }
    setSubiendoFoto(true);
    const fd = new FormData(); fd.append('archivo', file);
    try { const r = await api.post('/users/perfil/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); setAdmin({ ...admin, fotoUrl: r.data.url }); setSuccess('Foto actualizada'); setTimeout(() => setSuccess(''), 3000); }
    catch { setError('Error al subir foto'); setTimeout(() => setError(''), 3000); }
    finally { setSubiendoFoto(false); }
  };

  const handleSelectAll = (e) => { if (e.target.checked) setSelected(usuariosMostrar.map(u => u.id)); else setSelected([]); };
  const handleSelectOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleHabilitar = async () => {
    try { await Promise.all(selected.map(id => api.put(`/users/${id}/habilitar`))); setSuccess(`✅ ${selected.length} habilitado(s)`); setSelected([]); cargarDatos(); setTimeout(() => setSuccess(''), 3000); }
    catch { setError('Error al habilitar'); setTimeout(() => setError(''), 3000); }
  };
  const handleDeshabilitar = async () => {
    try { await Promise.all(selected.map(id => api.put(`/users/${id}/deshabilitar`))); setSuccess(`⚠️ ${selected.length} deshabilitado(s)`); setSelected([]); cargarDatos(); setTimeout(() => setSuccess(''), 3000); }
    catch { setError('Error al deshabilitar'); setTimeout(() => setError(''), 3000); }
  };
  const handleEliminarSeleccionados = () => setDeleteDialog({ open: true, users: usuarios.filter(u => selected.includes(u.id)) });
  const handleConfirmDelete = async () => {
    try { await Promise.all(deleteDialog.users.map(u => api.delete(`/users/${u.id}`))); setSuccess(`🗑️ ${deleteDialog.users.length} eliminado(s)`); setDeleteDialog({ open: false, users: [] }); setSelected([]); cargarDatos(); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError('Error al eliminar: ' + (err.response?.data || err.message)); setTimeout(() => setError(''), 5000); }
  };

  /* ── reportes: acciones ── */
  const handleRevisar = async (id) => {
    try { await api.put(`/reportes/${id}/revisar`); mostrarR('📋 Marcado como "En revisión"'); cargarReportes(); }
    catch { mostrarR('Error al actualizar', 'error'); }
  };
  const handleRechazarR = async (id) => {
    try { await api.put(`/reportes/${id}/rechazar`); mostrarR('Reporte rechazado'); cargarReportes(); }
    catch { mostrarR('Error al rechazar', 'error'); }
  };
  const handleEliminarR = async (id) => {
    try { await api.delete(`/reportes/${id}`); mostrarR('🗑️ Reporte eliminado'); cargarReportes(); }
    catch { mostrarR('Error al eliminar', 'error'); }
  };
  const handleResponder = async () => {
    if (!respuesta.trim()) return;
    setEnviandoR(true);
    try {
      await api.put(`/reportes/${responderDlg.reporte.id}/responder`, { respuesta });
      setResponderDlg({ open: false, reporte: null }); setRespuesta('');
      mostrarR('✅ Respuesta guardada — reporte marcado como Resuelto'); cargarReportes();
    } catch { mostrarR('Error al responder', 'error'); }
    finally { setEnviandoR(false); }
  };
  const abrirResponder = (reporte) => { setRespuesta(reporte.respuestaAdmin || ''); setResponderDlg({ open: true, reporte }); };

  const countR = (estado) => reportes.filter(r => r.estado === estado).length;
  const reportesFiltrados = () => {
    if (tabReportes === 1) return reportes.filter(r => r.estado === 'PENDIENTE');
    if (tabReportes === 2) return reportes.filter(r => r.estado === 'EN_REVISION');
    if (tabReportes === 3) return reportes.filter(r => r.estado === 'RESUELTO' || r.estado === 'RECHAZADO');
    return reportes;
  };

  /* ── usuarios filtrados ── */
  const usuariosMostrar = tabValue === 0 ? usuarios
    : tabValue === 1 ? usuarios.filter(u => u.role === 'USER')
    : usuarios.filter(u => u.role === 'SELLER');
  const isSelected = (id) => selected.includes(id);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar src={admin?.fotoUrl} sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: '#d32f2f' }}>
                {!admin?.fotoUrl && (admin?.nombreMostrado?.charAt(0) || 'A')}
              </Avatar>
              <input accept="image/*" style={{ display: 'none' }} id="foto-admin" type="file" onChange={handleFotoChange} />
              <label htmlFor="foto-admin">
                <IconButton component="span" disabled={subiendoFoto}
                  sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: '#1dbf73', color: 'white', '&:hover': { bgcolor: '#19a463' }, width: 32, height: 32 }}>
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </label>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">{admin?.nombreMostrado || admin?.username}</Typography>
              <Typography variant="body1" color="text.secondary">(Administrador)</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Badge de reportes pendientes en la campana */}
            <Tooltip title={`${countR('PENDIENTE')} reporte(s) pendiente(s)`}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ color: solicitudes.length > 0 ? '#d32f2f' : '#1dbf73' }}>
                <Badge badgeContent={solicitudes.length + countR('PENDIENTE')} color="error">
                  <NotificationsIcon fontSize="large" />
                </Badge>
              </IconButton>
            </Tooltip>
            <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Box>
        </Box>
      </Paper>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}

      {/* ══ TABLA DE USUARIOS ═══════════════════════════════════ */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Gestión de Usuarios</Typography>
        <Divider sx={{ mb: 2 }} />

        <Tabs value={tabValue} onChange={(e, v) => { setTabValue(v); setSelected([]); }} sx={{ mb: 2 }}>
          <Tab label={`Todos (${usuarios.length})`} />
          <Tab label={`Usuarios (${usuarios.filter(u => u.role === 'USER').length})`} />
          <Tab label={`Vendedores (${usuarios.filter(u => u.role === 'SELLER').length})`} />
        </Tabs>

        {selected.length > 0 && (
          <Toolbar sx={{ bgcolor: 'rgba(29,191,115,0.1)', borderRadius: 1, mb: 2, border: '2px solid #1dbf73' }}>
            <Typography sx={{ flex: '1 1 100%' }} variant="subtitle1" fontWeight="bold">{selected.length} seleccionado(s)</Typography>
            <Button variant="contained" startIcon={<CheckBoxIcon />} onClick={handleHabilitar}
              sx={{ mr: 1, bgcolor: '#1dbf73', '&:hover': { bgcolor: '#19a463' } }}>Habilitar</Button>
            <Button variant="contained" startIcon={<BlockIcon />} onClick={handleDeshabilitar} color="warning" sx={{ mr: 1 }}>Deshabilitar</Button>
            <Button variant="contained" startIcon={<DeleteIcon />} onClick={handleEliminarSeleccionados} color="error">Eliminar de BD</Button>
          </Toolbar>
        )}

        {usuariosMostrar.length === 0 ? (
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
                      onChange={handleSelectAll} />
                  </TableCell>
                  <TableCell><strong>Foto</strong></TableCell>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Usuario</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Rol</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuariosMostrar.map((usuario) => {
                  const sel = isSelected(usuario.id);
                  return (
                    <TableRow key={usuario.id} hover onClick={() => handleSelectOne(usuario.id)}
                      role="checkbox" selected={sel} sx={{ cursor: 'pointer' }}>
                      <TableCell padding="checkbox"><Checkbox checked={sel} /></TableCell>
                      <TableCell>
                        <Avatar src={usuario.fotoUrl} sx={{ width: 40, height: 40, bgcolor: '#1dbf73' }}>
                          {!usuario.fotoUrl && (usuario.nombreMostrado?.charAt(0) || usuario.username?.charAt(0))}
                        </Avatar>
                      </TableCell>
                      <TableCell>{usuario.nombreMostrado || usuario.username}</TableCell>
                      <TableCell>@{usuario.username}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
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
                          {usuario.habilitado ? (
                            <IconButton size="small" color="warning" title="Deshabilitar"
                              onClick={async () => { await api.put(`/users/${usuario.id}/deshabilitar`); cargarDatos(); setSuccess('Deshabilitado'); setTimeout(() => setSuccess(''), 3000); }}>
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            <IconButton size="small" color="success" title="Habilitar"
                              onClick={async () => { await api.put(`/users/${usuario.id}/habilitar`); cargarDatos(); setSuccess('Habilitado'); setTimeout(() => setSuccess(''), 3000); }}>
                              <CheckBoxIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton size="small" color="error" title="Eliminar"
                            onClick={() => setDeleteDialog({ open: true, users: [usuario] })}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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

      {/* ══ PANEL DE SOPORTE ═══════════════════════════════════ */}
      <SoporteAdmin />

      {/* ══ PANEL DE REPORTES ══════════════════════════════════ */}
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Badge badgeContent={countR('PENDIENTE')} color="error">
              <FlagIcon color="error" fontSize="large" />
            </Badge>
            <Box>
              <Typography variant="h6" fontWeight="bold">Panel de Reportes de Vendedores</Typography>
              <Typography variant="caption" color="text.secondary">{reportes.length} reporte(s) en total</Typography>
            </Box>
          </Box>
          <Tooltip title="Actualizar reportes">
            <IconButton onClick={cargarReportes} disabled={loadingReportes}><RefreshIcon /></IconButton>
          </Tooltip>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {successR && <Alert severity="success" sx={{ mb: 2 }}>{successR}</Alert>}
        {errorR   && <Alert severity="error"   sx={{ mb: 2 }}>{errorR}</Alert>}

        <Tabs value={tabReportes} onChange={(e, v) => setTabReportes(v)} sx={{ mb: 2 }} variant="scrollable">
          <Tab label={`Todos (${reportes.length})`} />
          <Tab label={
            <Badge badgeContent={countR('PENDIENTE')} color="error" sx={{ pr: 1.5 }}>Pendientes</Badge>
          } />
          <Tab label={`En revisión (${countR('EN_REVISION')})`} />
          <Tab label={`Cerrados (${countR('RESUELTO') + countR('RECHAZADO')})`} />
        </Tabs>

        {loadingReportes ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
        ) : reportesFiltrados().length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <FlagIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No hay reportes en esta categoría</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {reportesFiltrados().map(r => (
              <Paper key={r.id} variant="outlined" sx={{
                p: 2.5, borderRadius: 2,
                borderLeft: '4px solid',
                borderLeftColor:
                  r.estado === 'PENDIENTE'   ? '#f59e0b' :
                  r.estado === 'EN_REVISION' ? '#3b82f6' :
                  r.estado === 'RESUELTO'    ? '#10b981' : '#9ca3af',
                '&:hover': { boxShadow: 3 },
              }}>
                {/* Fila: motivo + estado + fecha */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {MOTIVO_LABEL[r.motivo] || r.motivo}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label={ESTADO_CONFIG[r.estado]?.label || r.estado}
                      color={ESTADO_CONFIG[r.estado]?.color || 'default'} size="small" />
                    <Typography variant="caption" color="text.disabled">{fmtDate(r.fechaReporte)}</Typography>
                  </Box>
                </Box>

                {/* Usuarios involucrados */}
                <Box sx={{ display: 'flex', gap: 3, mb: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={r.reportante?.fotoUrl} sx={{ width: 28, height: 28, bgcolor: '#6366f1', fontSize: '0.75rem' }}>
                      {r.reportante?.nombreMostrado?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1 }}>Reportó</Typography>
                      <Typography variant="body2" fontWeight="bold">{r.reportante?.nombreMostrado || '—'}</Typography>
                    </Box>
                  </Box>
                  <Typography color="text.disabled">→</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={r.vendedor?.fotoUrl} sx={{ width: 28, height: 28, bgcolor: '#dc2626', fontSize: '0.75rem' }}>
                      {r.vendedor?.nombreMostrado?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1 }}>Reportado</Typography>
                      <Typography variant="body2" fontWeight="bold">{r.vendedor?.nombreMostrado || '—'}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Publicación */}
                {r.producto && (
                  <Box sx={{ mb: 1.5, px: 1.5, py: 0.8, bgcolor: 'grey.50', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Publicación: </Typography>
                    <Typography variant="caption" fontWeight="bold">{r.producto.titulo}</Typography>
                  </Box>
                )}

                {/* Descripción */}
                {r.descripcion && (
                  <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'rgba(239,68,68,0.05)', borderRadius: 1.5, border: '1px solid rgba(239,68,68,0.15)' }}>
                    <Typography variant="caption" color="error.main" fontWeight="bold">Descripción del usuario:</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>{r.descripcion}</Typography>
                  </Box>
                )}

                {/* Respuesta del admin */}
                {r.respuestaAdmin && (
                  <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'rgba(16,185,129,0.05)', borderRadius: 1.5, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      ✅ Respuesta del administrador ({fmtDate(r.fechaRespuesta)}):
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>{r.respuestaAdmin}</Typography>
                  </Box>
                )}

                {/* Acciones */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<VisibilityIcon />}
                    onClick={() => setDetalleRDlg({ open: true, reporte: r })}
                    sx={{ borderRadius: 2, textTransform: 'none' }}>Detalle</Button>

                  {r.estado === 'PENDIENTE' && (
                    <Button size="small" variant="outlined" color="info"
                      onClick={() => handleRevisar(r.id)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}>Tomar caso</Button>
                  )}

                  {(r.estado === 'PENDIENTE' || r.estado === 'EN_REVISION') && (
                    <>
                      <Button size="small" variant="contained" color="success" startIcon={<ReplyIcon />}
                        onClick={() => abrirResponder(r)}
                        sx={{ borderRadius: 2, textTransform: 'none' }}>
                        {r.respuestaAdmin ? 'Editar respuesta' : 'Responder'}
                      </Button>
                      <Button size="small" variant="outlined" color="warning" startIcon={<CancelIcon />}
                        onClick={() => handleRechazarR(r.id)}
                        sx={{ borderRadius: 2, textTransform: 'none' }}>Rechazar</Button>
                    </>
                  )}

                  <IconButton size="small" color="error" onClick={() => handleEliminarR(r.id)}
                    sx={{ ml: 'auto', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      {/* ══ MENÚ DE NOTIFICACIONES ══════════════════════════════ */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 400, maxHeight: 500 } }}>
        <MenuItem disabled>
          <Typography variant="h6" fontWeight="bold">🔔 Solicitudes de Vendedor ({solicitudes.length})</Typography>
        </MenuItem>
        <Divider />
        {solicitudes.length === 0 ? (
          <MenuItem disabled><Typography variant="body2" color="text.secondary">No hay solicitudes pendientes</Typography></MenuItem>
        ) : solicitudes.map(s => (
          <Box key={s.id} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="body1" fontWeight="bold">{s.nombreMostrado || s.username}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>@{s.username} - {s.email}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />}
                onClick={() => handleAprobarSolicitud(s.id)} sx={{ flex: 1 }}>Aprobar</Button>
              <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
                onClick={() => handleRechazarSolicitud(s.id)} sx={{ flex: 1 }}>Rechazar</Button>
            </Box>
          </Box>
        ))}
      </Menu>

      {/* ══ DIALOG CONFIRMAR ELIMINAR USUARIO ═══════════════════ */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, users: [] })}>
        <DialogTitle>⚠️ ¿Estás seguro?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta acción eliminará <strong>permanentemente</strong> {deleteDialog.users.length} usuario(s):
            {deleteDialog.users.map(u => (
              <Box key={u.id} sx={{ mt: 1, ml: 2 }}>• <strong>@{u.username}</strong> ({u.email})</Box>
            ))}
            <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
              <Typography variant="body2" color="error" fontWeight="bold">⚠️ Esta acción NO se puede deshacer</Typography>
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

      {/* ══ DIALOG DETALLE REPORTE ══════════════════════════════ */}
      <Dialog open={detalleRDlg.open} onClose={() => setDetalleRDlg({ open: false, reporte: null })}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {detalleRDlg.reporte && (() => { const r = detalleRDlg.reporte; return (
          <>
            <Box sx={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FlagIcon sx={{ color: 'white', fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>{MOTIVO_LABEL[r.motivo] || r.motivo}</Typography>
                  <Chip label={ESTADO_CONFIG[r.estado]?.label} size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', height: 20 }} />
                </Box>
              </Box>
            </Box>
            <DialogContent sx={{ pt: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Reportó</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar src={r.reportante?.fotoUrl} sx={{ width: 32, height: 32, bgcolor: '#6366f1' }}>{r.reportante?.nombreMostrado?.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{r.reportante?.nombreMostrado}</Typography>
                      <Typography variant="caption" color="text.secondary">@{r.reportante?.username}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Vendedor reportado</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar src={r.vendedor?.fotoUrl} sx={{ width: 32, height: 32, bgcolor: '#dc2626' }}>{r.vendedor?.nombreMostrado?.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{r.vendedor?.nombreMostrado}</Typography>
                      <Typography variant="caption" color="text.secondary">@{r.vendedor?.username}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary">Fecha</Typography>
              <Typography variant="body2" gutterBottom>{fmtDate(r.fechaReporte)}</Typography>
              {r.producto && <>
                <Typography variant="caption" color="text.secondary">Publicación</Typography>
                <Typography variant="body2" fontWeight="bold" gutterBottom>{r.producto.titulo}</Typography>
              </>}
              {r.descripcion && <>
                <Typography variant="caption" color="text.secondary">Descripción del usuario</Typography>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mt: 0.5, mb: 1.5 }}>
                  <Typography variant="body2">{r.descripcion}</Typography>
                </Paper>
              </>}
              {r.respuestaAdmin && <>
                <Typography variant="caption" color="success.main" fontWeight="bold">
                  Respuesta del administrador ({fmtDate(r.fechaRespuesta)})
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mt: 0.5, border: '1px solid rgba(16,185,129,0.3)', bgcolor: 'rgba(16,185,129,0.03)' }}>
                  <Typography variant="body2">{r.respuestaAdmin}</Typography>
                </Paper>
              </>}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={() => setDetalleRDlg({ open: false, reporte: null })} variant="outlined" sx={{ borderRadius: 2 }}>Cerrar</Button>
              {(r.estado === 'PENDIENTE' || r.estado === 'EN_REVISION') && (
                <Button variant="contained" color="success" startIcon={<ReplyIcon />}
                  onClick={() => { setDetalleRDlg({ open: false, reporte: null }); abrirResponder(r); }}
                  sx={{ borderRadius: 2 }}>
                  {r.respuestaAdmin ? 'Editar respuesta' : 'Responder'}
                </Button>
              )}
            </DialogActions>
          </>
        ); })()}
      </Dialog>

      {/* ══ DIALOG RESPONDER REPORTE ════════════════════════════ */}
      <Dialog open={responderDlg.open} onClose={() => !enviandoR && setResponderDlg({ open: false, reporte: null })}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReplyIcon color="success" /> Responder reporte
        </DialogTitle>
        <DialogContent>
          {responderDlg.reporte && (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" color="text.secondary">Motivo: </Typography>
              <Typography variant="body2" fontWeight="bold">{MOTIVO_LABEL[responderDlg.reporte.motivo]}</Typography>
              {responderDlg.reporte.descripcion && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  "{responderDlg.reporte.descripcion}"
                </Typography>
              )}
            </Paper>
          )}
          <TextField fullWidth multiline rows={4} autoFocus
            label="Tu respuesta *"
            placeholder="Escribe la resolución o resultado de la revisión..."
            value={respuesta} onChange={e => setRespuesta(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2, fontSize: '0.8rem' }}>
            Al guardar, el reporte se marcará automáticamente como <strong>Resuelto</strong>.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setResponderDlg({ open: false, reporte: null })} disabled={enviandoR} variant="outlined" sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleResponder}
            disabled={enviandoR || !respuesta.trim()}
            startIcon={enviandoR ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
            sx={{ borderRadius: 2 }}>
            {enviandoR ? 'Guardando...' : 'Guardar respuesta'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default AdminDashboard;
