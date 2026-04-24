import React, { useEffect, useState, useCallback } from 'react';
import {
  Paper, Box, Typography, Button, IconButton, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Tabs, Tab, Stack, TextField,
  Avatar, CircularProgress, Badge, Fade,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import ReplyIcon from '@mui/icons-material/Reply';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../../services/api';
import { useLanguage } from '../../LanguageContext';

const ESTADO_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: 'warning' },
  EN_REVISION: { label: 'En revisión', color: 'info' },
  RESUELTO: { label: 'Resuelto', color: 'success' },
  RECHAZADO: { label: 'Rechazado', color: 'default' },
};

const MOTIVO_LABEL = {
  FRAUDE: 'Fraude o estafa',
  CONTENIDO_INAPROPIADO: 'Contenido inapropiado',
  SPAM: 'Spam o publicidad engañosa',
  PRODUCTO_FALSO: 'Producto falso o inexistente',
  MAL_COMPORTAMIENTO: 'Mal comportamiento',
  PRECIO_ENGAÑOSO: 'Precio engañoso',
  OTRO: 'Otro motivo',
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const AdminReportes = () => {
  const { t } = useLanguage();
  const [reportes, setReportes] = useState([]);
  const [loadingReportes, setLoadingReportes] = useState(true);
  const [tabReportes, setTabReportes] = useState(0);
  const [responderDlg, setResponderDlg] = useState({ open: false, reporte: null });
  const [detalleRDlg, setDetalleRDlg] = useState({ open: false, reporte: null });
  const [respuesta, setRespuesta] = useState('');
  const [enviandoR, setEnviandoR] = useState(false);
  const [successR, setSuccessR] = useState('');
  const [errorR, setErrorR] = useState('');
  const [rechazarDlg, setRechazarDlg] = useState({ open: false, id: null });
  const [mensajeRechazo, setMensajeRechazo] = useState('');
  const [enviandoRechazo, setEnviandoRechazo] = useState(false);
  const [eliminarDlg, setEliminarDlg] = useState({ open: false, id: null });
  const [eliminandoR, setEliminandoR] = useState(false);

  const cargarReportes = useCallback(async () => {
    setLoadingReportes(true);
    try {
      const res = await api.get('/reportes/admin');
      setReportes(Array.isArray(res.data) ? res.data : []);
      setErrorR('');
    } catch (err) {
      setErrorR(`Error al cargar reportes: ${err.response?.data || err.message}`);
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  useEffect(() => {
    cargarReportes();
  }, [cargarReportes]);

  const mostrarR = (msg, tipo = 'success') => {
    if (tipo === 'error') {
      setErrorR(msg);
      setTimeout(() => setErrorR(''), 4000);
    } else {
      setSuccessR(msg);
      setTimeout(() => setSuccessR(''), 3500);
    }
  };

  const handleRevisar = async (id) => {
    try {
      await api.put(`/reportes/${id}/revisar`);
      mostrarR('Marcado como "En revisión"');
      cargarReportes();
    } catch {
      mostrarR('Error al actualizar', 'error');
    }
  };
  const handleRechazarR = (id) => {
    setRechazarDlg({ open: true, id });
    setMensajeRechazo('');
  };

  const confirmarRechazo = async () => {
    if (!rechazarDlg.id) return;
    setEnviandoRechazo(true);
    try {
      const body = mensajeRechazo.trim() ? { mensaje: mensajeRechazo.trim() } : {};
      await api.put(`/reportes/${rechazarDlg.id}/rechazar`, body);
      setRechazarDlg({ open: false, id: null });
      setMensajeRechazo('');
      mostrarR('Reporte rechazado');
      cargarReportes();
    } catch {
      mostrarR('Error al rechazar', 'error');
    } finally {
      setEnviandoRechazo(false);
    }
  };
  const handleEliminarR = (id) => {
    setEliminarDlg({ open: true, id });
  };

  const confirmarEliminarR = async () => {
    if (!eliminarDlg.id) return;
    setEliminandoR(true);
    try {
      await api.delete(`/reportes/${eliminarDlg.id}`);
      setEliminarDlg({ open: false, id: null });
      mostrarR('Reporte eliminado');
      cargarReportes();
    } catch {
      mostrarR('Error al eliminar', 'error');
    } finally {
      setEliminandoR(false);
    }
  };
  const handleResponder = async () => {
    if (!respuesta.trim()) return;
    setEnviandoR(true);
    try {
      await api.put(`/reportes/${responderDlg.reporte.id}/responder`, { respuesta });
      setResponderDlg({ open: false, reporte: null });
      setRespuesta('');
      mostrarR('Respuesta guardada; reporte marcado como resuelto');
      cargarReportes();
    } catch {
      mostrarR('Error al responder', 'error');
    } finally {
      setEnviandoR(false);
    }
  };
  const abrirResponder = (reporte) => {
    setRespuesta(reporte.respuestaAdmin || '');
    setResponderDlg({ open: true, reporte });
  };

  const countR = (estado) => reportes.filter((r) => r.estado === estado).length;
  const reportesFiltrados = () => {
    if (tabReportes === 1) return reportes.filter((r) => r.estado === 'PENDIENTE');
    if (tabReportes === 2) return reportes.filter((r) => r.estado === 'EN_REVISION');
    if (tabReportes === 3) return reportes.filter((r) => r.estado === 'RESUELTO' || r.estado === 'RECHAZADO');
    return reportes;
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Badge badgeContent={countR('PENDIENTE')} color="error">
              <FlagIcon color="error" fontSize="large" />
            </Badge>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Panel de Reportes de Vendedores
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {reportes.length} reporte(s) en total
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={cargarReportes} disabled={loadingReportes} aria-label="Actualizar reportes">
            <RefreshIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {successR && <Alert severity="success" sx={{ mb: 2 }}>{successR}</Alert>}
        {errorR && <Alert severity="error" sx={{ mb: 2 }}>{errorR}</Alert>}

        <Tabs value={tabReportes} onChange={(e, v) => setTabReportes(v)} sx={{ mb: 2 }} variant="scrollable">
          <Tab label={`Todos (${reportes.length})`} />
          <Tab
            label={(
              <Badge badgeContent={countR('PENDIENTE')} color="error" sx={{ pr: 1.5 }}>
                Pendientes
              </Badge>
            )}
          />
          <Tab label={`En revisión (${countR('EN_REVISION')})`} />
          <Tab label={`Cerrados (${countR('RESUELTO') + countR('RECHAZADO')})`} />
        </Tabs>

        {loadingReportes ? (
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
            {reportesFiltrados().map((r) => (
              <Paper
                key={r.id}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderLeftColor:
                    r.estado === 'PENDIENTE' ? '#f59e0b'
                    : r.estado === 'EN_REVISION' ? '#3b82f6'
                    : r.estado === 'RESUELTO' ? '#10b981'
                    : '#9ca3af',
                  '&:hover': { boxShadow: 3 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {MOTIVO_LABEL[r.motivo] || r.motivo}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label={ESTADO_CONFIG[r.estado]?.label || r.estado} color={ESTADO_CONFIG[r.estado]?.color || 'default'} size="small" />
                    <Typography variant="caption" color="text.disabled">{fmtDate(r.fechaReporte)}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 3, mb: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={r.reportante?.fotoUrl} sx={{ width: 28, height: 28, bgcolor: '#6366f1', fontSize: '0.75rem' }}>
                      {r.reportante?.nombreMostrado?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1 }}>
                        Reportó
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">{r.reportante?.nombreMostrado || '—'}</Typography>
                    </Box>
                  </Box>
                  <Typography color="text.disabled">→</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={r.vendedor?.fotoUrl} sx={{ width: 28, height: 28, bgcolor: '#dc2626', fontSize: '0.75rem' }}>
                      {r.vendedor?.nombreMostrado?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1 }}>
                        Reportado
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">{r.vendedor?.nombreMostrado || '—'}</Typography>
                    </Box>
                  </Box>
                </Box>

                {r.producto && (
                  <Box sx={{ mb: 1.5, px: 1.5, py: 0.8, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Publicación: </Typography>
                    <Typography variant="caption" fontWeight="bold">{r.producto.titulo}</Typography>
                  </Box>
                )}

                {r.descripcion && (
                  <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'rgba(239,68,68,0.05)', borderRadius: 1.5, border: '1px solid rgba(239,68,68,0.15)' }}>
                    <Typography variant="caption" color="error.main" fontWeight="bold">
                      Descripción del usuario:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>{r.descripcion}</Typography>
                  </Box>
                )}

                {r.respuestaAdmin && (
                  <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'rgba(16,185,129,0.05)', borderRadius: 1.5, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      Respuesta del administrador ({fmtDate(r.fechaRespuesta)}):
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>{r.respuestaAdmin}</Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => setDetalleRDlg({ open: true, reporte: r })} sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Detalle
                  </Button>
                  {r.estado === 'PENDIENTE' && (
                    <Button size="small" variant="outlined" color="info" onClick={() => handleRevisar(r.id)} sx={{ borderRadius: 2, textTransform: 'none' }}>
                      Tomar caso
                    </Button>
                  )}
                  {(r.estado === 'PENDIENTE' || r.estado === 'EN_REVISION') && (
                    <>
                      <Button size="small" variant="contained" color="success" startIcon={<ReplyIcon />} onClick={() => abrirResponder(r)} sx={{ borderRadius: 2, textTransform: 'none' }}>
                        {r.respuestaAdmin ? 'Editar respuesta' : 'Responder'}
                      </Button>
                      <Button size="small" variant="outlined" color="warning" startIcon={<CancelIcon />} onClick={() => handleRechazarR(r.id)} sx={{ borderRadius: 2, textTransform: 'none' }}>
                        Rechazar
                      </Button>
                    </>
                  )}
                  <IconButton size="small" color="error" onClick={() => handleEliminarR(r.id)} sx={{ ml: 'auto', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      <Dialog open={detalleRDlg.open} onClose={() => setDetalleRDlg({ open: false, reporte: null })} maxWidth="sm" fullWidth TransitionComponent={Fade} transitionDuration={240} PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {detalleRDlg.reporte && (() => {
          const r = detalleRDlg.reporte;
          return (
            <>
              <Box sx={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FlagIcon sx={{ color: 'white', fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                      {MOTIVO_LABEL[r.motivo] || r.motivo}
                    </Typography>
                    <Chip
                      label={ESTADO_CONFIG[r.estado]?.label}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', height: 20 }}
                    />
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
                <Typography variant="caption" color="text.secondary">Fecha</Typography>
                <Typography variant="body2" gutterBottom>{fmtDate(r.fechaReporte)}</Typography>
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
                      Respuesta del administrador ({fmtDate(r.fechaRespuesta)})
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mt: 0.5, border: '1px solid rgba(16,185,129,0.3)', bgcolor: 'rgba(16,185,129,0.03)' }}>
                      <Typography variant="body2">{r.respuestaAdmin}</Typography>
                    </Paper>
                  </>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={() => setDetalleRDlg({ open: false, reporte: null })} variant="outlined" sx={{ borderRadius: 2 }}>
                  Cerrar
                </Button>
                {(r.estado === 'PENDIENTE' || r.estado === 'EN_REVISION') && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ReplyIcon />}
                    onClick={() => {
                      setDetalleRDlg({ open: false, reporte: null });
                      abrirResponder(r);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    {r.respuestaAdmin ? 'Editar respuesta' : 'Responder'}
                  </Button>
                )}
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      <Dialog open={responderDlg.open} onClose={() => !enviandoR && setResponderDlg({ open: false, reporte: null })} maxWidth="sm" fullWidth TransitionComponent={Fade} transitionDuration={240} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReplyIcon color="success" /> Responder reporte
        </DialogTitle>
        <DialogContent>
          {responderDlg.reporte && (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 2, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary">Motivo: </Typography>
              <Typography variant="body2" fontWeight="bold">{MOTIVO_LABEL[responderDlg.reporte.motivo]}</Typography>
              {responderDlg.reporte.descripcion && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  &quot;{responderDlg.reporte.descripcion}&quot;
                </Typography>
              )}
            </Paper>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            autoFocus
            label="Tu respuesta *"
            placeholder="Escribe la resolución o resultado de la revisión..."
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2, fontSize: '0.8rem' }}>
            Al guardar, el reporte se marcará automáticamente como <strong>Resuelto</strong>.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setResponderDlg({ open: false, reporte: null })} disabled={enviandoR} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleResponder}
            disabled={enviandoR || !respuesta.trim()}
            startIcon={enviandoR ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
            sx={{ borderRadius: 2 }}
          >
            {enviandoR ? 'Guardando...' : 'Guardar respuesta'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={eliminarDlg.open}
        onClose={() => !eliminandoR && setEliminarDlg({ open: false, id: null })}
        maxWidth="xs" fullWidth
        TransitionComponent={Fade}
        transitionDuration={240}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Eliminar reporte</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Estás seguro de eliminar este reporte? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            disabled={eliminandoR}
            onClick={() => setEliminarDlg({ open: false, id: null })}
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={eliminandoR}
            onClick={confirmarEliminarR}
            startIcon={eliminandoR ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            {eliminandoR ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rechazarDlg.open} onClose={() => !enviandoRechazo && setRechazarDlg({ open: false, id: null })} maxWidth="xs" fullWidth TransitionComponent={Fade} transitionDuration={240} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{t.rejectReportTitle}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t.rejectReportHint}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label={t.rejectReportPlaceholder}
            placeholder={t.rejectReportPlaceholder}
            value={mensajeRechazo}
            onChange={(e) => setMensajeRechazo(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" disabled={enviandoRechazo} onClick={() => setRechazarDlg({ open: false, id: null })} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button variant="contained" color="warning" disabled={enviandoRechazo} onClick={confirmarRechazo} sx={{ borderRadius: 2 }}>
            {enviandoRechazo ? '…' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminReportes;
