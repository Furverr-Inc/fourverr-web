import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Avatar, Chip, Button, IconButton,
  Divider, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Tooltip, Badge,
  Tab, Tabs, Stack
} from '@mui/material';
import FlagIcon        from '@mui/icons-material/Flag';
import ReplyIcon       from '@mui/icons-material/Reply';
import DeleteIcon      from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon      from '@mui/icons-material/Cancel';
import VisibilityIcon  from '@mui/icons-material/Visibility';
import PersonIcon      from '@mui/icons-material/Person';
import RefreshIcon     from '@mui/icons-material/Refresh';
import api from '../services/api';

const ESTADO_CONFIG = {
  PENDIENTE:    { label: 'Pendiente',    color: 'warning' },
  EN_REVISION:  { label: 'En revisión',  color: 'info'    },
  RESUELTO:     { label: 'Resuelto',     color: 'success' },
  RECHAZADO:    { label: 'Rechazado',    color: 'default' },
};

const MOTIVO_LABEL = {
  FRAUDE:                'Fraude o estafa',
  CONTENIDO_INAPROPIADO: 'Contenido inapropiado',
  SPAM:                  'Spam o publicidad engañosa',
  PRODUCTO_FALSO:        'Producto falso o inexistente',
  MAL_COMPORTAMIENTO:    'Mal comportamiento',
  PRECIO_ENGAÑOSO:       'Precio engañoso',
  OTRO:                  'Otro motivo',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const ReportesAdmin = () => {
  const [reportes,       setReportes]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState('');
  const [tabValue,       setTabValue]       = useState(0);

  // Dialog responder
  const [responderDialog, setResponderDialog] = useState({ open: false, reporte: null });
  const [respuesta,        setRespuesta]       = useState('');
  const [enviandoR,        setEnviandoR]       = useState(false);

  // Dialog detalle
  const [detalleDialog, setDetalleDialog] = useState({ open: false, reporte: null });

  const cargarReportes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reportes/admin');
      setReportes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Error al cargar los reportes: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarReportes(); }, [cargarReportes]);

  const mostrar = (msg, tipo = 'success') => {
    setSuccess(msg); setTimeout(() => setSuccess(''), 3500);
    if (tipo === 'error') { setError(msg); setTimeout(() => setError(''), 4000); }
  };

  const handleRevisar = async (id) => {
    try {
      await api.put(`/reportes/${id}/revisar`);
      mostrar('Reporte marcado como "En revisión"');
      cargarReportes();
    } catch { mostrar('Error al actualizar estado', 'error'); }
  };

  const handleRechazar = async (id) => {
    try {
      await api.put(`/reportes/${id}/rechazar`);
      mostrar('Reporte rechazado');
      cargarReportes();
    } catch { mostrar('Error al rechazar', 'error'); }
  };

  const handleEliminar = async (id) => {
    try {
      await api.delete(`/reportes/${id}`);
      mostrar('Reporte eliminado');
      cargarReportes();
    } catch { mostrar('Error al eliminar', 'error'); }
  };

  const handleResponder = async () => {
    if (!respuesta.trim()) return;
    setEnviandoR(true);
    try {
      await api.put(`/reportes/${responderDialog.reporte.id}/responder`, { respuesta });
      setResponderDialog({ open: false, reporte: null });
      setRespuesta('');
      mostrar('✅ Respuesta enviada y reporte marcado como resuelto');
      cargarReportes();
    } catch { mostrar('Error al responder', 'error'); }
    finally { setEnviandoR(false); }
  };

  const abrirResponder = (reporte) => {
    setRespuesta(reporte.respuestaAdmin || '');
    setResponderDialog({ open: true, reporte });
  };

  const reportesFiltrados = () => {
    if (tabValue === 0) return reportes;
    if (tabValue === 1) return reportes.filter(r => r.estado === 'PENDIENTE');
    if (tabValue === 2) return reportes.filter(r => r.estado === 'EN_REVISION');
    if (tabValue === 3) return reportes.filter(r => r.estado === 'RESUELTO' || r.estado === 'RECHAZADO');
    return reportes;
  };

  const countBy = (estado) => reportes.filter(r => r.estado === estado).length;

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mt: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Badge badgeContent={countBy('PENDIENTE')} color="error">
            <FlagIcon color="error" fontSize="large" />
          </Badge>
          <Box>
            <Typography variant="h6" fontWeight="bold">Panel de Reportes</Typography>
            <Typography variant="caption" color="text.secondary">
              {reportes.length} reporte(s) en total
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Actualizar">
          <IconButton onClick={cargarReportes} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {success && !error && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
      {error   &&           <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab label={`Todos (${reportes.length})`} />
        <Tab label={
          <Badge badgeContent={countBy('PENDIENTE')} color="error" sx={{ pr: 1.5 }}>
            Pendientes
          </Badge>
        } />
        <Tab label={`En revisión (${countBy('EN_REVISION')})`} />
        <Tab label={`Cerrados (${countBy('RESUELTO') + countBy('RECHAZADO')})`} />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : reportesFiltrados().length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <FlagIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No hay reportes en esta categoría</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {reportesFiltrados().map(reporte => (
            <Paper key={reporte.id} variant="outlined" sx={{
              p: 2.5, borderRadius: 2,
              borderLeft: '4px solid',
              borderLeftColor:
                reporte.estado === 'PENDIENTE'   ? '#f59e0b' :
                reporte.estado === 'EN_REVISION' ? '#3b82f6' :
                reporte.estado === 'RESUELTO'    ? '#10b981' : '#9ca3af',
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 3 },
            }}>
              {/* Fila superior: motivo + estado + fecha */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {MOTIVO_LABEL[reporte.motivo] || reporte.motivo}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={ESTADO_CONFIG[reporte.estado]?.label || reporte.estado}
                    color={ESTADO_CONFIG[reporte.estado]?.color || 'default'}
                    size="small" />
                  <Typography variant="caption" color="text.disabled">
                    {formatDate(reporte.fechaReporte)}
                  </Typography>
                </Box>
              </Box>

              {/* Usuarios involucrados */}
              <Box sx={{ display: 'flex', gap: 3, mb: 1.5, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={reporte.reportante?.fotoUrl} sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#6366f1' }}>
                    {reporte.reportante?.nombreMostrado?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1 }}>Reportó</Typography>
                    <Typography variant="body2" fontWeight="bold">{reporte.reportante?.nombreMostrado || '—'}</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1.5 }}>→</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={reporte.vendedor?.fotoUrl} sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#dc2626' }}>
                    {reporte.vendedor?.nombreMostrado?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1 }}>Vendedor reportado</Typography>
                    <Typography variant="body2" fontWeight="bold">{reporte.vendedor?.nombreMostrado || '—'}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Producto */}
              {reporte.producto && (
                <Box sx={{ mb: 1.5, px: 1.5, py: 0.8, bgcolor: 'grey.50', borderRadius: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">Publicación involucrada: </Typography>
                  <Typography variant="caption" fontWeight="bold">{reporte.producto.titulo}</Typography>
                </Box>
              )}

              {/* Descripción del reporte */}
              {reporte.descripcion && (
                <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'rgba(239,68,68,0.05)', borderRadius: 1.5, border: '1px solid rgba(239,68,68,0.15)' }}>
                  <Typography variant="caption" color="error.main" fontWeight="bold">Descripción del reporte:</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>{reporte.descripcion}</Typography>
                </Box>
              )}

              {/* Respuesta del admin */}
              {reporte.respuestaAdmin && (
                <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'rgba(16,185,129,0.05)', borderRadius: 1.5, border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Typography variant="caption" color="success.main" fontWeight="bold">
                    ✅ Respuesta del administrador ({formatDate(reporte.fechaRespuesta)}):
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>{reporte.respuestaAdmin}</Typography>
                </Box>
              )}

              {/* Acciones */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                <Tooltip title="Ver detalle completo">
                  <Button size="small" variant="outlined" startIcon={<VisibilityIcon />}
                    onClick={() => setDetalleDialog({ open: true, reporte })}
                    sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Detalle
                  </Button>
                </Tooltip>

                {reporte.estado === 'PENDIENTE' && (
                  <Tooltip title="Marcar como 'En revisión'">
                    <Button size="small" variant="outlined" color="info" startIcon={<PersonIcon />}
                      onClick={() => handleRevisar(reporte.id)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}>
                      Tomar caso
                    </Button>
                  </Tooltip>
                )}

                {(reporte.estado === 'PENDIENTE' || reporte.estado === 'EN_REVISION') && (
                  <>
                    <Button size="small" variant="contained" color="success" startIcon={<ReplyIcon />}
                      onClick={() => abrirResponder(reporte)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}>
                      {reporte.respuestaAdmin ? 'Editar respuesta' : 'Responder'}
                    </Button>
                    <Tooltip title="Rechazar reporte (no procede)">
                      <Button size="small" variant="outlined" color="warning" startIcon={<CancelIcon />}
                        onClick={() => handleRechazar(reporte.id)}
                        sx={{ borderRadius: 2, textTransform: 'none' }}>
                        Rechazar
                      </Button>
                    </Tooltip>
                  </>
                )}

                <Tooltip title="Eliminar reporte del sistema">
                  <IconButton size="small" color="error"
                    onClick={() => handleEliminar(reporte.id)}
                    sx={{ ml: 'auto', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* ── DIALOG DETALLE ── */}
      <Dialog open={detalleDialog.open} onClose={() => setDetalleDialog({ open: false, reporte: null })}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {detalleDialog.reporte && (() => {
          const r = detalleDialog.reporte;
          return (
            <>
              <Box sx={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FlagIcon sx={{ color: 'white', fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                      {MOTIVO_LABEL[r.motivo] || r.motivo}
                    </Typography>
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
                      <Avatar src={r.reportante?.fotoUrl} sx={{ width: 32, height: 32, bgcolor: '#6366f1' }}>
                        {r.reportante?.nombreMostrado?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{r.reportante?.nombreMostrado}</Typography>
                        <Typography variant="caption" color="text.secondary">@{r.reportante?.username}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Vendedor reportado</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Avatar src={r.vendedor?.fotoUrl} sx={{ width: 32, height: 32, bgcolor: '#dc2626' }}>
                        {r.vendedor?.nombreMostrado?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{r.vendedor?.nombreMostrado}</Typography>
                        <Typography variant="caption" color="text.secondary">@{r.vendedor?.username}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">Fecha del reporte</Typography>
                <Typography variant="body2" gutterBottom>{formatDate(r.fechaReporte)}</Typography>
                {r.producto && (
                  <>
                    <Typography variant="caption" color="text.secondary">Publicación</Typography>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>{r.producto.titulo}</Typography>
                  </>
                )}
                {r.descripcion && (
                  <>
                    <Typography variant="caption" color="text.secondary">Descripción del usuario</Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mt: 0.5, mb: 1.5 }}>
                      <Typography variant="body2">{r.descripcion}</Typography>
                    </Paper>
                  </>
                )}
                {r.respuestaAdmin && (
                  <>
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      Respuesta del administrador ({formatDate(r.fechaRespuesta)})
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mt: 0.5, border: '1px solid rgba(16,185,129,0.3)', bgcolor: 'rgba(16,185,129,0.03)' }}>
                      <Typography variant="body2">{r.respuestaAdmin}</Typography>
                    </Paper>
                  </>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={() => setDetalleDialog({ open: false, reporte: null })} variant="outlined" sx={{ borderRadius: 2 }}>
                  Cerrar
                </Button>
                {(r.estado === 'PENDIENTE' || r.estado === 'EN_REVISION') && (
                  <Button variant="contained" color="success" startIcon={<ReplyIcon />}
                    onClick={() => { setDetalleDialog({ open: false, reporte: null }); abrirResponder(r); }}
                    sx={{ borderRadius: 2 }}>
                    {r.respuestaAdmin ? 'Editar respuesta' : 'Responder'}
                  </Button>
                )}
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* ── DIALOG RESPONDER ── */}
      <Dialog open={responderDialog.open} onClose={() => !enviandoR && setResponderDialog({ open: false, reporte: null })}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReplyIcon color="success" />
          Responder reporte
        </DialogTitle>
        <DialogContent>
          {responderDialog.reporte && (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" color="text.secondary">Motivo: </Typography>
              <Typography variant="body2" fontWeight="bold">
                {MOTIVO_LABEL[responderDialog.reporte.motivo]}
              </Typography>
              {responderDialog.reporte.descripcion && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  "{responderDialog.reporte.descripcion}"
                </Typography>
              )}
            </Paper>
          )}
          <TextField
            fullWidth multiline rows={4} autoFocus
            label="Tu respuesta al reporte *"
            placeholder="Escribe aquí la resolución o el resultado de la revisión..."
            value={respuesta}
            onChange={e => setRespuesta(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2, fontSize: '0.8rem' }}>
            Al guardar la respuesta, el reporte se marcará automáticamente como <strong>Resuelto</strong>.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setResponderDialog({ open: false, reporte: null })} disabled={enviandoR}
            variant="outlined" sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button variant="contained" color="success" onClick={handleResponder}
            disabled={enviandoR || !respuesta.trim()}
            startIcon={enviandoR ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
            sx={{ borderRadius: 2 }}>
            {enviandoR ? 'Guardando...' : 'Guardar respuesta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ReportesAdmin;
