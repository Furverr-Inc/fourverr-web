import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogContent, DialogActions, Button, Typography, Box,
  Avatar, Chip, Divider, IconButton, Stack, Tooltip,
  Snackbar, Alert, TextField, CircularProgress, Paper,
  Popover, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import CloseIcon          from '@mui/icons-material/Close';
import ShoppingCartIcon   from '@mui/icons-material/ShoppingCart';
import ZoomInIcon         from '@mui/icons-material/ZoomIn';
import StarBorderIcon     from '@mui/icons-material/StarBorder';
import SendIcon           from '@mui/icons-material/Send';
import DeleteIcon         from '@mui/icons-material/Delete';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PersonIcon         from '@mui/icons-material/Person';
import FlagIcon           from '@mui/icons-material/Flag';
import OpenInNewIcon      from '@mui/icons-material/OpenInNew';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { useNavigate }    from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { BRAND_PERIW, BRAND_PERIW_HOVER } from '../brandColors';

const MOTIVOS = [
  { value: 'FRAUDE',                label: 'Fraude o estafa' },
  { value: 'CONTENIDO_INAPROPIADO', label: 'Contenido inapropiado' },
  { value: 'SPAM',                  label: 'Spam o publicidad engañosa' },
  { value: 'PRODUCTO_FALSO',        label: 'Producto falso o inexistente' },
  { value: 'MAL_COMPORTAMIENTO',    label: 'Mal comportamiento o acoso' },
  { value: 'PRECIO_ENGAÑOSO',       label: 'Precio engañoso' },
  { value: 'OTRO',                  label: 'Otro motivo' },
];

const ProductoModal = ({ open, onClose, producto }) => {
  const navigate = useNavigate();
  const { isDark } = useThemeMode();
  const { t } = useLanguage();
  const preguntasRef = useRef(null);

  const [enWishlist,   setEnWishlist]   = useState(false);
  const [loadingWish,  setLoadingWish]  = useState(false);
  const [snack,        setSnack]        = useState({ open: false, msg: '', severity: 'success' });

  const [preguntas,        setPreguntas]        = useState([]);
  const [loadingPregs,     setLoadingPregs]     = useState(false);
  const [nuevaPregunta,    setNuevaPregunta]    = useState('');
  const [enviando,         setEnviando]         = useState(false);
  const [respondiendo,     setRespondiendo]     = useState(null);
  const [textoRespuesta,   setTextoRespuesta]   = useState('');
  const [eliminandoPregId, setEliminandoPregId] = useState(null);

  // ── Panel vendedor (Popover) ──
  const [vendorAnchor,  setVendorAnchor]  = useState(null);
  const vendorPanelOpen = Boolean(vendorAnchor);

  // ── Lightbox de imagen ──
  const [imagenOpen, setImagenOpen] = useState(false);

  // ── Dialog de reporte ──
  const [reporteOpen,   setReporteOpen]   = useState(false);
  const [motivo,        setMotivo]        = useState('');
  const [descripcionR,  setDescripcionR]  = useState('');
  const [enviandoR,     setEnviandoR]     = useState(false);

  const usuarioId = localStorage.getItem('usuarioId');
  const esVendedor = producto?.vendedor?.id != null && String(producto.vendedor.id) === String(usuarioId);
  const estaLogueado = !!localStorage.getItem('token');

  useEffect(() => {
    if (!producto || !open) return;
    if (estaLogueado) {
      api.get(`/favoritos/check/${producto.id}`)
        .then(r => setEnWishlist(r.data.esFavorito))
        .catch(() => {});
    }
    cargarPreguntas();
  }, [producto, open]);

  const cargarPreguntas = async () => {
    if (!producto) return;
    setLoadingPregs(true);
    try {
      const r = await api.get(`/preguntas/producto/${producto.id}`);
      setPreguntas(r.data);
    } catch { setPreguntas([]); }
    finally   { setLoadingPregs(false); }
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!estaLogueado) { setSnack({ open: true, msg: 'Inicia sesión para usar la wishlist', severity: 'warning' }); return; }
    setLoadingWish(true);
    try {
      if (enWishlist) {
        await api.delete(`/favoritos/${producto.id}`);
        setEnWishlist(false);
        setSnack({ open: true, msg: 'Quitado de tu wishlist', severity: 'info' });
        window.dispatchEvent(new Event('zento-favoritos-cambiados'));
      } else {
        await api.post(`/favoritos/${producto.id}`);
        setEnWishlist(true);
        setSnack({ open: true, msg: 'Agregado a tu wishlist', severity: 'success' });
        window.dispatchEvent(new Event('zento-favoritos-cambiados'));
      }
    } catch (err) {
      const msg = err.response?.data;
      setSnack({ open: true, msg: typeof msg === 'string' ? msg : 'Error al actualizar wishlist', severity: 'error' });
    } finally { setLoadingWish(false); }
  };

  const handleEnviarPregunta = async () => {
    if (!nuevaPregunta.trim()) return;
    setEnviando(true);
    try {
      await api.post(`/preguntas/producto/${producto.id}`, { texto: nuevaPregunta });
      setNuevaPregunta('');
      await cargarPreguntas();
      setSnack({ open: true, msg: 'Pregunta enviada', severity: 'success' });
    } catch {
      setSnack({ open: true, msg: 'Error al enviar la pregunta', severity: 'error' });
    } finally { setEnviando(false); }
  };

  const handleResponder = async (preguntaId) => {
    if (!textoRespuesta.trim()) return;
    try {
      await api.put(`/preguntas/${preguntaId}/responder`, { respuesta: textoRespuesta });
      setRespondiendo(null); setTextoRespuesta('');
      await cargarPreguntas();
    } catch { setSnack({ open: true, msg: 'Error al responder', severity: 'error' }); }
  };

  const handleEliminarPregunta = async (preguntaId) => {
    setEliminandoPregId(preguntaId);
    try {
      await api.delete(`/preguntas/${preguntaId}`);
      setPreguntas(prev => prev.filter(p => p.id !== preguntaId));
      setSnack({ open: true, msg: 'Pregunta eliminada', severity: 'info' });
    } catch {
      setSnack({ open: true, msg: 'Error al eliminar la pregunta', severity: 'error' });
    } finally { setEliminandoPregId(null); }
  };

  const handleVerVendedor = () => {
    if (producto?.vendedor?.username) {
      setVendorAnchor(null);
      onClose();
      navigate(`/perfil/${producto.vendedor.username}`);
    }
  };

  const handleAbrirReporte = () => {
    if (!estaLogueado) {
      setSnack({ open: true, msg: 'Inicia sesión para reportar a un vendedor', severity: 'warning' });
      setVendorAnchor(null);
      return;
    }
    setVendorAnchor(null);
    setMotivo('');
    setDescripcionR('');
    setReporteOpen(true);
  };

  const handleEnviarReporte = async () => {
    if (!motivo) { setSnack({ open: true, msg: 'Selecciona un motivo', severity: 'warning' }); return; }
    setEnviandoR(true);
    try {
      await api.post('/reportes', {
        vendedorId:  producto.vendedor.id,
        productoId:  producto.id,
        motivo,
        descripcion: descripcionR.trim() || null,
      });
      setReporteOpen(false);
      setSnack({ open: true, msg: '✅ Reporte enviado. El equipo lo revisará pronto.', severity: 'success' });
      window.dispatchEvent(new Event('zento-reportes-actualizado'));
    } catch (err) {
      const msg = err.response?.data;
      setSnack({ open: true, msg: typeof msg === 'string' ? msg : 'Error al enviar el reporte', severity: 'error' });
    } finally { setEnviandoR(false); }
  };

  if (!producto) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: { xs: '100dvh', sm: 'min(90vh, 900px)' },
            boxShadow: isDark ? '0 20px 60px rgba(124,58,237,0.3)' : '0 20px 60px rgba(55,48,163,0.15)',
          },
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {/* Imagen con lightbox */}
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={producto.urlArchivo || producto.urlPortada || 'https://via.placeholder.com/600x300?text=Sin+Imagen'}
              alt={producto.titulo}
              onClick={() => setImagenOpen(true)}
              sx={{
                width: '100%',
                height: 240,
                maxHeight: '40vh',
                objectFit: 'cover',
                display: 'block',
                cursor: 'zoom-in',
                transition: 'filter 0.2s',
                '&:hover': { filter: 'brightness(0.85)' },
                '@media (max-height: 520px)': {
                  height: 'clamp(88px, 26vh, 160px)',
                  maxHeight: '32vh',
                },
              }}
            />
          {/* Ícono zoom sobre la imagen */}
          <Box onClick={() => setImagenOpen(true)} sx={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s', cursor: 'zoom-in',
            '&:hover': { opacity: 1 },
          }}>
            <ZoomInIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.9)',
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }} />
          </Box>
          <IconButton onClick={onClose}
            sx={{ position: 'absolute', top: 10, right: 10,
              bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
            <CloseIcon />
          </IconButton>
          <Tooltip title={enWishlist ? 'Quitar de wishlist' : 'Agregar a wishlist'}>
            <IconButton onClick={handleToggleWishlist} disabled={loadingWish}
              sx={{
                position: 'absolute', top: 10, left: 10,
                bgcolor: enWishlist ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.92)',
                border: enWishlist ? '2px solid #f59e0b' : '2px solid transparent',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: enWishlist ? 'rgba(245,158,11,0.25)' : 'white', transform: 'scale(1.1)' }
              }}>
              <StarBorderIcon sx={{
                fontSize: 22,
                color: enWishlist ? '#f59e0b' : (isDark ? 'rgba(167,139,250,0.9)' : '#3730a3'),
              }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ p: 3 }}>

          {/* ── SECCIÓN VENDEDOR — click abre Popover ── */}
          <Box
            onClick={(e) => setVendorAnchor(e.currentTarget)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
              cursor: 'pointer', borderRadius: 2, p: 1, mx: -1,
              transition: 'background 0.18s',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(55,48,163,0.05)',
              },
            }}>
            <Avatar src={producto.vendedor?.fotoUrl}
              sx={{ width: 42, height: 42, bgcolor: 'primary.main', fontWeight: 'bold', border: '2px solid', borderColor: 'primary.light' }}>
              {producto.vendedor?.nombreMostrado?.charAt(0) || '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" fontWeight="bold" color="primary.main"
                  sx={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                  {producto.vendedor?.nombreMostrado || 'Vendedor'}
                </Typography>
                <VerifiedOutlinedIcon sx={{ fontSize: 14, color: '#1dbf73' }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {t.vendorPanelHint}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>▼</Typography>
          </Box>

          {/* ── POPOVER PANEL VENDEDOR ── */}
          <Popover
            open={vendorPanelOpen}
            anchorEl={vendorAnchor}
            onClose={() => setVendorAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
              sx: {
                borderRadius: 3, p: 0, width: 300, overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              }
            }}>
            {/* Header del panel */}
            <Box sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              p: 2.5, pb: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={producto.vendedor?.fotoUrl}
                  sx={{ width: 52, height: 52, border: '2px solid rgba(255,255,255,0.5)', fontSize: '1.3rem' }}>
                  {producto.vendedor?.nombreMostrado?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                      {producto.vendedor?.nombreMostrado || 'Vendedor'}
                    </Typography>
                    <VerifiedOutlinedIcon sx={{ fontSize: 16, color: '#a5f3c0' }} />
                  </Box>
                  <Chip label="Vendedor verificado" size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', height: 20, fontSize: '0.65rem' }} />
                </Box>
              </Box>
            </Box>

            {/* Acciones */}
            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Button
                fullWidth
                startIcon={<PersonIcon />}
                endIcon={<OpenInNewIcon fontSize="small" />}
                onClick={handleVerVendedor}
                variant="contained"
                sx={{
                  justifyContent: 'flex-start',
                  borderRadius: 2, py: 1.2,
                  bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' },
                  textTransform: 'none', fontWeight: 600,
                }}>
                Ver perfil completo
              </Button>

              {!esVendedor && (
                <Button
                  fullWidth
                  startIcon={<QuestionAnswerIcon />}
                  onClick={() => {
                    setVendorAnchor(null);
                    setTimeout(() => {
                      preguntasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  variant="outlined"
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 2, py: 1.2,
                    textTransform: 'none', fontWeight: 600,
                    borderColor: 'rgba(99,102,241,0.5)',
                    color: '#6366f1',
                    '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99,102,241,0.06)' },
                  }}
                >
                  {t.contactSellerBtn}
                </Button>
              )}

              {!esVendedor && (
                <Button
                  fullWidth
                  startIcon={<FlagIcon />}
                  onClick={handleAbrirReporte}
                  variant="outlined"
                  color="error"
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 2, py: 1.2,
                    textTransform: 'none', fontWeight: 600,
                    borderColor: 'rgba(239,68,68,0.4)',
                    '&:hover': { bgcolor: 'rgba(239,68,68,0.06)', borderColor: '#ef4444' },
                  }}>
                  Reportar a este vendedor
                </Button>
              )}

              <Button fullWidth onClick={() => setVendorAnchor(null)}
                sx={{ borderRadius: 2, py: 0.8, color: 'text.secondary', textTransform: 'none', fontSize: '0.8rem' }}>
                Cancelar
              </Button>
            </Box>
          </Popover>

          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.3 }}>
            {producto.titulo}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Chip label={producto.tipo?.replace(/_/g, ' ')} color="primary" size="small" variant="outlined" />
            <Typography variant="h5" color="success.main" fontWeight="bold">${producto.precio}</Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Descripción</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {producto.descripcion || 'Este vendedor no ha añadido una descripción.'}
          </Typography>

          {/* ── PREGUNTAS Y RESPUESTAS ── */}
          <Divider sx={{ my: 3 }} />
          <Box ref={preguntasRef} sx={{ scrollMarginTop: 16 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <QuestionAnswerIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight="bold">Preguntas y Respuestas</Typography>
            {preguntas.length > 0 && <Chip label={preguntas.length} size="small" color="primary" />}
          </Box>

          {!estaLogueado && (
            <Box sx={{
              mb: 2, p: 1.5, borderRadius: 2,
              bgcolor: isDark ? 'rgba(139,143,200,0.1)' : 'rgba(99,102,241,0.06)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(139,143,200,0.25)' : 'rgba(99,102,241,0.2)',
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t.loginToAskBanner}
              </Typography>
              <Button size="small" variant="contained" onClick={() => { onClose(); navigate('/login'); }}
                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: BRAND_PERIW, '&:hover': { bgcolor: BRAND_PERIW_HOVER } }}>
                {t.login}
              </Button>
            </Box>
          )}

          {estaLogueado && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField fullWidth size="small"
                placeholder={t.askSeller}
                value={nuevaPregunta}
                onChange={e => setNuevaPregunta(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviarPregunta(); } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button variant="contained" size="small" onClick={handleEnviarPregunta}
                disabled={enviando || !nuevaPregunta.trim()}
                sx={{ minWidth: 44, px: 1.5, borderRadius: 2 }}>
                {enviando ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
              </Button>
            </Box>
          )}

          {loadingPregs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : preguntas.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 1.5 }}>
              {t.noQuestions}
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {preguntas.map(p => {
                const esAutorPregunta = String(p.usuario?.id) === String(usuarioId);
                const puedeEliminar  = esAutorPregunta || esVendedor;
                return (
                  <Paper key={p.id} variant="outlined"
                    sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'grey.50' }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Avatar src={p.usuario?.fotoUrl}
                        sx={{ width: 26, height: 26, fontSize: '0.7rem', bgcolor: 'secondary.main', flexShrink: 0 }}>
                        {p.usuario?.nombreMostrado?.charAt(0) || '?'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">
                          {p.usuario?.nombreMostrado || 'Usuario'}
                        </Typography>
                        <Typography variant="body2">{p.texto}</Typography>
                      </Box>
                      {puedeEliminar && (
                        <Tooltip title={esVendedor && !esAutorPregunta ? 'Eliminar pregunta (moderación)' : 'Eliminar mi pregunta'}>
                          <IconButton size="small" color="error" disabled={eliminandoPregId === p.id}
                            onClick={() => handleEliminarPregunta(p.id)}
                            sx={{ mt: -0.5, opacity: 0.6, '&:hover': { opacity: 1 } }}>
                            {eliminandoPregId === p.id
                              ? <CircularProgress size={14} color="error" />
                              : <DeleteIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    {p.respuesta && (
                      <Box sx={{ mt: 1, ml: 4, pl: 1.5, borderLeft: '2px solid', borderColor: 'primary.main' }}>
                        <Typography variant="caption" fontWeight="bold" color="primary.main">
                          {p.respondidoPor?.nombreMostrado || 'Vendedor'} · Vendedor
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{p.respuesta}</Typography>
                      </Box>
                    )}
                    {esVendedor && !p.respuesta && (
                      respondiendo === p.id ? (
                        <Box sx={{ mt: 1, ml: 4, display: 'flex', gap: 1 }}>
                          <TextField fullWidth size="small" placeholder="Tu respuesta..."
                            value={textoRespuesta} onChange={e => setTextoRespuesta(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                          <Button size="small" variant="contained" onClick={() => handleResponder(p.id)}
                            sx={{ borderRadius: 2, minWidth: 44, px: 1 }}>
                            <SendIcon fontSize="small" />
                          </Button>
                          <Button size="small" onClick={() => { setRespondiendo(null); setTextoRespuesta(''); }}>
                            Cancelar
                          </Button>
                        </Box>
                      ) : (
                        <Button size="small" sx={{ mt: 0.5, ml: 4 }} onClick={() => setRespondiendo(p.id)}>
                          Responder
                        </Button>
                      )
                    )}
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Box>
        </Box>

        <DialogActions
          sx={{
            flexShrink: 0,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: 3,
            py: 2,
            gap: 1,
          }}
        >
          <Button onClick={onClose} variant="outlined" sx={{ flex: 1 }}>Cerrar</Button>
          {!esVendedor && (
            <Button variant="contained" startIcon={<ShoppingCartIcon />}
              onClick={() => { onClose(); navigate('/detalle-compra', { state: { producto } }); }}
              sx={{ flex: 2, py: 1.2 }}>
              Comprar ahora
            </Button>
          )}
        </DialogActions>
        </Box>
      </Dialog>

      {/* ── DIALOG REPORTAR VENDEDOR ── */}
      <Dialog open={reporteOpen} onClose={() => !enviandoR && setReporteOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {/* Header rojo */}
        <Box sx={{
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <FlagIcon sx={{ color: 'white', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', lineHeight: 1 }}>
              Reportar vendedor
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              {producto.vendedor?.nombreMostrado}
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Tu reporte es anónimo. El equipo de Zento revisará el caso y tomará las medidas necesarias.
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Motivo del reporte *</InputLabel>
            <Select
              value={motivo}
              label="Motivo del reporte *"
              onChange={e => setMotivo(e.target.value)}
              sx={{ borderRadius: 2 }}>
              {MOTIVOS.map(m => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth multiline rows={3}
            label="Descripción adicional (opcional)"
            placeholder="Cuéntanos más detalles sobre lo que ocurrió..."
            value={descripcionR}
            onChange={e => setDescripcionR(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Info del producto reportado — mismo lenguaje visual que Select/TextField outlined */}
          <Paper
            variant="outlined"
            sx={(theme) => ({
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.05)
                  : theme.palette.grey[50],
              borderColor:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.23)
                  : alpha(theme.palette.common.black, 0.23),
            })}
          >
            <Typography variant="caption" color="text.secondary" display="block">
              Publicación involucrada:
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="text.primary" noWrap>
              {producto.titulo}
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setReporteOpen(false)} disabled={enviandoR} variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            variant="contained" color="error" onClick={handleEnviarReporte}
            disabled={enviandoR || !motivo}
            startIcon={enviandoR ? <CircularProgress size={16} color="inherit" /> : <FlagIcon />}
            sx={{ flex: 2, borderRadius: 2 }}>
            {enviandoR ? 'Enviando...' : 'Enviar reporte'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ LIGHTBOX IMAGEN ══════════════════════════════════════ */}
      <Dialog
        open={imagenOpen}
        onClose={() => setImagenOpen(false)}
        maxWidth="xl"
        PaperProps={{
          sx: {
            background: 'rgba(0,0,0,0.95)',
            boxShadow: 'none',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
          }
        }}
      >
        <IconButton
          onClick={() => setImagenOpen(false)}
          sx={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.12)', color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          component="img"
          src={producto.urlArchivo || producto.urlPortada}
          alt={producto.titulo}
          sx={{
            maxWidth: '90vw', maxHeight: '85vh',
            objectFit: 'contain', display: 'block',
          }}
        />
        <Box sx={{ px: 2, py: 1.5, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {producto.titulo}
          </Typography>
        </Box>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );
};

export default ProductoModal;
