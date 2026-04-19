import React, { useEffect, useState, useCallback } from 'react';
import {
  Paper, Box, Typography, Button, IconButton, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Toolbar, Divider, Tabs, Tab,
  Checkbox, Tooltip, Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import PersonIcon from '@mui/icons-material/Person';
import api from '../../services/api';
import { BRAND_NAVY, BRAND_PERIW, BRAND_PERIW_HOVER, BRAND_BORDER, BRAND_TEXT } from '../../brandColors';

const AdminUsuarios = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [detalleDialog, setDetalleDialog] = useState({ open: false, usuario: null });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selected, setSelected] = useState([]);

  // ── Retiros ──
  const [retiros, setRetiros] = useState([]);
  const [retirosLoading, setRetirosLoading] = useState(false);
  const [retiroAccionId, setRetiroAccionId] = useState(null); // id procesándose

  const cargarRetiros = useCallback(async () => {
    setRetirosLoading(true);
    try {
      const r = await api.get('/users/retiros/todos');
      setRetiros(Array.isArray(r.data) ? r.data : []);
    } catch { setRetiros([]); }
    finally { setRetirosLoading(false); }
  }, []);

  const handleAprobarRetiro = async (id) => {
    setRetiroAccionId(id);
    try {
      await api.put(`/users/retiros/${id}/aprobar`);
      setSuccess('Retiro marcado como completado. Realiza la transferencia SPEI al vendedor.');
      setTimeout(() => setSuccess(''), 6000);
      cargarRetiros();
    } catch { setError('Error al aprobar el retiro'); setTimeout(() => setError(''), 4000); }
    finally { setRetiroAccionId(null); }
  };

  const handleRechazarRetiro = async (id) => {
    setRetiroAccionId(id);
    try {
      await api.put(`/users/retiros/${id}/rechazar`);
      setSuccess('Retiro rechazado. El saldo fue devuelto al vendedor.');
      setTimeout(() => setSuccess(''), 5000);
      cargarRetiros();
    } catch { setError('Error al rechazar el retiro'); setTimeout(() => setError(''), 4000); }
    finally { setRetiroAccionId(null); }
  };

  const cargarUsuarios = useCallback(async () => {
    try {
      const usrRes = await api.get('/users/todos');
      setUsuarios(Array.isArray(usrRes.data) ? usrRes.data : []);
      setError('');
    } catch (err) {
      const s = err.response?.status;
      const m = err.response?.data;
      setError(s === 403 ? `Backend rechazó (403): "${m}"` : `Error usuarios (${s}): ${m}`);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
    cargarRetiros();
    const interval = setInterval(() => { cargarUsuarios(); cargarRetiros(); }, 30000);
    return () => clearInterval(interval);
  }, [cargarUsuarios, cargarRetiros]);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelected(usuariosMostrar.map((u) => u.id));
    else setSelected([]);
  };
  const handleSelectOne = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleHabilitar = async () => {
    try {
      await Promise.all(selected.map((id) => api.put(`/users/${id}/habilitar`)));
      setSuccess(`${selected.length} habilitado(s)`);
      setSelected([]);
      cargarUsuarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Error al habilitar');
      setTimeout(() => setError(''), 3000);
    }
  };
  const handleDeshabilitar = async () => {
    try {
      await Promise.all(selected.map((id) => api.put(`/users/${id}/deshabilitar`)));
      setSuccess(`${selected.length} deshabilitado(s)`);
      setSelected([]);
      cargarUsuarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Error al deshabilitar');
      setTimeout(() => setError(''), 3000);
    }
  };
  const handleEliminarSeleccionados = () =>
    setDeleteDialog({ open: true, users: usuarios.filter((u) => selected.includes(u.id)) });
  const handleConfirmDelete = async () => {
    try {
      await Promise.all(deleteDialog.users.map((u) => api.delete(`/users/${u.id}`)));
      setSuccess(`${deleteDialog.users.length} eliminado(s)`);
      setDeleteDialog({ open: false, users: [] });
      setSelected([]);
      cargarUsuarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Error al eliminar: ${err.response?.data || err.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const usuariosMostrar =
    tabValue === 0 ? usuarios
    : tabValue === 1 ? usuarios.filter((u) => u.role === 'USER')
    : usuarios.filter((u) => u.role === 'SELLER');
  const isSelected = (id) => selected.includes(id);

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Tabs
          value={tabValue}
          onChange={(e, v) => { setTabValue(v); setSelected([]); }}
          sx={{
            mb: 2,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 44 },
            '& .Mui-selected': { fontWeight: 700 },
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab label={`Todos (${usuarios.length})`} />
          <Tab label={`Usuarios (${usuarios.filter((u) => u.role === 'USER').length})`} />
          <Tab label={`Vendedores (${usuarios.filter((u) => u.role === 'SELLER').length})`} />
        </Tabs>

        {selected.length > 0 && (
          <Toolbar
            sx={{
              borderRadius: 1,
              mb: 2,
              border: '2px solid',
              borderColor: 'success.main',
              bgcolor: isDark ? 'rgba(125,211,160,0.1)' : 'rgba(46,125,82,0.08)',
            }}
          >
            <Typography sx={{ flex: '1 1 100%', color: 'text.primary' }} variant="subtitle1" fontWeight="bold">
              {selected.length} seleccionado(s)
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckBoxIcon />}
              onClick={handleHabilitar}
              sx={{ mr: 1 }}
            >
              Habilitar
            </Button>
            <Button variant="contained" startIcon={<BlockIcon />} onClick={handleDeshabilitar} color="warning" sx={{ mr: 1 }}>
              Deshabilitar
            </Button>
            <Button variant="contained" startIcon={<DeleteIcon />} onClick={handleEliminarSeleccionados} color="error">
              Eliminar de BD
            </Button>
          </Toolbar>
        )}

        {loading ? (
          <Typography color="text.secondary">Cargando usuarios…</Typography>
        ) : usuariosMostrar.length === 0 ? (
          <Alert severity="info">No hay usuarios en esta categoría</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    padding="checkbox"
                    sx={{
                      bgcolor: isDark ? 'rgba(15,24,48,0.95)' : 'rgba(13,17,39,0.04)',
                      borderBottomColor: 'divider',
                    }}
                  >
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < usuariosMostrar.length}
                      checked={usuariosMostrar.length > 0 && selected.length === usuariosMostrar.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  {['Foto', 'Nombre', 'Usuario', 'Email', 'Rol', 'Estado', 'Acciones'].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 700,
                        color: isDark ? 'rgba(200,202,212,0.92)' : 'text.secondary',
                        bgcolor: isDark ? 'rgba(15,24,48,0.95)' : 'rgba(13,17,39,0.04)',
                        borderBottomColor: 'divider',
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {usuariosMostrar.map((usuario) => {
                  const sel = isSelected(usuario.id);
                  return (
                    <TableRow
                      key={usuario.id}
                      hover
                      onClick={() => handleSelectOne(usuario.id)}
                      role="checkbox"
                      selected={sel}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={sel} />
                      </TableCell>
                      <TableCell>
                        <Avatar
                          src={usuario.fotoUrl}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: BRAND_PERIW,
                            color: '#fff',
                            fontWeight: 700,
                          }}
                        >
                          {!usuario.fotoUrl && (usuario.nombreMostrado?.charAt(0) || usuario.username?.charAt(0))}
                        </Avatar>
                      </TableCell>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>
                        {usuario.nombreMostrado || usuario.username}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: isDark ? BRAND_PERIW : BRAND_NAVY,
                          fontWeight: 600,
                        }}
                      >
                        @{usuario.username}
                      </TableCell>
                      <TableCell sx={{ color: 'text.primary' }}>{usuario.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.role === 'SELLER' ? 'Vendedor' : 'Usuario'}
                          size="small"
                          variant={usuario.role === 'SELLER' ? 'filled' : 'outlined'}
                          sx={
                            usuario.role === 'SELLER'
                              ? {
                                  fontWeight: 700,
                                  bgcolor: isDark ? BRAND_PERIW : BRAND_NAVY,
                                  color: '#fff',
                                  border: 'none',
                                  '&:hover': { bgcolor: isDark ? BRAND_PERIW_HOVER : '#161d36' },
                                }
                              : {
                                  fontWeight: 600,
                                  borderColor: isDark ? BRAND_BORDER : 'rgba(13,17,39,0.2)',
                                  color: isDark ? BRAND_TEXT : BRAND_NAVY,
                                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,17,39,0.04)',
                                }
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.habilitado ? 'Habilitado' : 'Deshabilitado'}
                          size="small"
                          variant="outlined"
                          sx={
                            usuario.habilitado
                              ? {
                                  fontWeight: 700,
                                  borderColor: isDark ? 'rgba(125,211,160,0.55)' : 'rgba(46,125,82,0.45)',
                                  color: isDark ? '#B6F0C8' : '#1B5E32',
                                  bgcolor: isDark ? 'rgba(125,211,160,0.12)' : 'rgba(46,125,82,0.08)',
                                }
                              : {
                                  fontWeight: 700,
                                  borderColor: isDark ? 'rgba(248,113,113,0.5)' : 'rgba(192,57,43,0.45)',
                                  color: isDark ? '#FCA5A5' : '#9B2C2C',
                                  bgcolor: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(192,57,43,0.06)',
                                }
                          }
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" color="info" onClick={() => setDetalleDialog({ open: true, usuario })}>
                              <PersonIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {usuario.habilitado ? (
                            <IconButton
                              size="small"
                              color="warning"
                              title="Deshabilitar"
                              onClick={async () => {
                                await api.put(`/users/${usuario.id}/deshabilitar`);
                                cargarUsuarios();
                                setSuccess('Deshabilitado');
                                setTimeout(() => setSuccess(''), 3000);
                              }}
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            <IconButton
                              size="small"
                              color="success"
                              title="Habilitar"
                              onClick={async () => {
                                await api.put(`/users/${usuario.id}/habilitar`);
                                cargarUsuarios();
                                setSuccess('Habilitado');
                                setTimeout(() => setSuccess(''), 3000);
                              }}
                            >
                              <CheckBoxIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            title="Eliminar"
                            onClick={() => setDeleteDialog({ open: true, users: [usuario] })}
                          >
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

      <Dialog open={detalleDialog.open} onClose={() => setDetalleDialog({ open: false, usuario: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {detalleDialog.usuario && (() => {
          const u = detalleDialog.usuario;
          return (
            <>
              <Box sx={{ background: 'linear-gradient(135deg, #1dbf73, #19a463)', p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={u.fotoUrl} sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.3)', fontSize: '1.5rem' }}>
                    {!u.fotoUrl && (u.nombreMostrado?.charAt(0) || u.username?.charAt(0))}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                      {u.nombreMostrado || u.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>@{u.username}</Typography>
                  </Box>
                </Box>
              </Box>
              <DialogContent sx={{ pt: 2.5 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {[
                    { label: 'Email', val: u.email },
                    { label: 'Teléfono', val: u.telefono || '—' },
                    { label: 'Ciudad', val: u.ciudad || '—' },
                    { label: 'País', val: u.pais || '—' },
                    { label: 'Sitio web', val: u.sitioWeb || '—' },
                    { label: 'Saldo', val: `$${u.saldoDisponible ?? 0}` },
                  ].map(({ label, val }) => (
                    <Box key={label}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" fontWeight="bold">{val}</Typography>
                    </Box>
                  ))}
                </Box>
                {u.descripcion && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Descripción</Typography>
                    <Typography variant="body2">{u.descripcion}</Typography>
                  </Box>
                )}
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={u.role === 'SELLER' ? 'Vendedor' : 'Usuario'}
                    size="small"
                    variant={u.role === 'SELLER' ? 'filled' : 'outlined'}
                    sx={
                      u.role === 'SELLER'
                        ? { fontWeight: 700, bgcolor: isDark ? BRAND_PERIW : BRAND_NAVY, color: '#fff' }
                        : {
                            fontWeight: 600,
                            borderColor: isDark ? BRAND_BORDER : 'rgba(13,17,39,0.2)',
                            color: isDark ? BRAND_TEXT : BRAND_NAVY,
                            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,17,39,0.04)',
                          }
                    }
                  />
                  <Chip
                    label={u.habilitado ? 'Habilitado' : 'Deshabilitado'}
                    size="small"
                    variant="outlined"
                    sx={
                      u.habilitado
                        ? {
                            fontWeight: 700,
                            borderColor: isDark ? 'rgba(125,211,160,0.55)' : 'rgba(46,125,82,0.45)',
                            color: isDark ? '#B6F0C8' : '#1B5E32',
                            bgcolor: isDark ? 'rgba(125,211,160,0.12)' : 'rgba(46,125,82,0.08)',
                          }
                        : {
                            fontWeight: 700,
                            borderColor: isDark ? 'rgba(248,113,113,0.5)' : 'rgba(192,57,43,0.45)',
                            color: isDark ? '#FCA5A5' : '#9B2C2C',
                            bgcolor: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(192,57,43,0.06)',
                          }
                    }
                  />
                  {u.solicitudVendedor && (
                    <Chip
                      label="Solicitud pendiente"
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        borderColor: isDark ? 'rgba(251,191,36,0.5)' : 'rgba(180,83,9,0.45)',
                        color: isDark ? '#FCD34D' : '#92400E',
                        bgcolor: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(180,83,9,0.08)',
                      }}
                    />
                  )}
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={() => setDetalleDialog({ open: false, usuario: null })} variant="outlined" sx={{ borderRadius: 2 }}>
                  Cerrar
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, users: [] })}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberOutlinedIcon color="warning" />
          ¿Estás seguro?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta acción eliminará <strong>permanentemente</strong> {deleteDialog.users.length} usuario(s):
            {deleteDialog.users.map((u) => (
              <Box key={u.id} sx={{ mt: 1, ml: 2 }}>
                • <strong>@{u.username}</strong> ({u.email})
              </Box>
            ))}
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: isDark ? 'rgba(248,113,113,0.12)' : '#ffebee',
                border: '1px solid',
                borderColor: isDark ? 'rgba(248,113,113,0.25)' : 'rgba(211,47,47,0.2)',
              }}
            >
              <Typography variant="body2" color="error" fontWeight="bold">
                Esta acción no se puede deshacer
              </Typography>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, users: [] })} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Sí, Eliminar {deleteDialog.users.length} Usuario(s)
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════ PANEL DE RETIROS ══════════════ */}
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Solicitudes de Retiro
          </Typography>
          <Button size="small" variant="outlined" onClick={cargarRetiros} disabled={retirosLoading}
            sx={{ textTransform: 'none', borderRadius: 2 }}>
            {retirosLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Cuando apruebes una solicitud, realiza manualmente la transferencia SPEI a la CLABE del vendedor y márcala como completada.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {retiros.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" variant="body2">No hay solicitudes de retiro aún.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Vendedor</strong></TableCell>
                  <TableCell><strong>Monto</strong></TableCell>
                  <TableCell><strong>CLABE</strong></TableCell>
                  <TableCell><strong>Notas</strong></TableCell>
                  <TableCell><strong>Fecha</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {retiros.map((r) => (
                  <TableRow key={r.id} sx={{ opacity: r.estado !== 'PENDIENTE' ? 0.6 : 1 }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>@{r.vendedor?.username}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.vendedor?.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="success.main">
                        ${Number(r.monto || 0).toFixed(2)} MXN
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {r.clabeSnapshot ? (
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: 0.5 }}>
                          {r.clabeSnapshot}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="warning.main">Sin CLABE</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {r.notas || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {r.fechaSolicitud ? new Date(r.fechaSolicitud).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.estado}
                        size="small"
                        color={r.estado === 'PENDIENTE' ? 'warning' : r.estado === 'COMPLETADO' ? 'success' : 'error'}
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {r.estado === 'PENDIENTE' && (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small" variant="contained" color="success"
                            disabled={retiroAccionId === r.id}
                            onClick={() => handleAprobarRetiro(r.id)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, fontSize: '0.75rem' }}
                          >
                            {retiroAccionId === r.id ? '...' : 'Aprobar ✓'}
                          </Button>
                          <Button
                            size="small" variant="outlined" color="error"
                            disabled={retiroAccionId === r.id}
                            onClick={() => handleRechazarRetiro(r.id)}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, fontSize: '0.75rem' }}
                          >
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
        )}
      </Paper>
    </>
  );
};

export default AdminUsuarios;
