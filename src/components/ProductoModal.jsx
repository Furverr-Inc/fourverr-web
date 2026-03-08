import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogActions, Button, Typography, Box,
  Avatar, Chip, Divider, IconButton, Stack, Tooltip,
  Snackbar, Alert, TextField, CircularProgress, Paper, Rating
} from '@mui/material';
import CloseIcon          from '@mui/icons-material/Close';
import ShoppingCartIcon   from '@mui/icons-material/ShoppingCart';
import StarIcon           from '@mui/icons-material/Star';
import StarBorderIcon     from '@mui/icons-material/StarBorder';
import SendIcon           from '@mui/icons-material/Send';
import DeleteIcon         from '@mui/icons-material/Delete';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import RateReviewIcon     from '@mui/icons-material/RateReview';
import { useNavigate }    from 'react-router-dom';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

const ProductoModal = ({ open, onClose, producto }) => {
  const navigate = useNavigate();
  const { isDark } = useThemeMode();
  const { t } = useLanguage();

  const [enWishlist,   setEnWishlist]   = useState(false);
  const [loadingWish,  setLoadingWish]  = useState(false);
  const [snack,        setSnack]        = useState({ open: false, msg: '', severity: 'success' });
  const [preguntas,      setPreguntas]      = useState([]);
  const [loadingPregs,   setLoadingPregs]   = useState(false);
  const [nuevaPregunta,  setNuevaPregunta]  = useState('');
  const [enviando,       setEnviando]       = useState(false);
  const [respondiendo,   setRespondiendo]   = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [eliminandoPregId, setEliminandoPregId] = useState(null);

  // Reseñas
  const [resenas,       setResenas]       = useState([]);
  const [promedioRating,setPromedioRating]= useState(0);
  const [totalResenas,  setTotalResenas]  = useState(0);
  const [loadingResenas,setLoadingResenas]= useState(false);

  const usernameLocal = localStorage.getItem('usuarioUsername') || localStorage.getItem('usuarioNombre');
  const usuarioId     = localStorage.getItem('usuarioId');
  const esVendedor = producto?.vendedor?.username === usernameLocal ||
                     producto?.vendedor?.nombreMostrado === usernameLocal;

  useEffect(() => {
    if (!producto || !open) return;
    if (localStorage.getItem('token')) {
      api.get(`/favoritos/check/${producto.id}`)
        .then(r => setEnWishlist(r.data.esFavorito))
        .catch(() => {});
    }
    cargarPreguntas();
    cargarResenas();
  }, [producto, open]);

  const cargarPreguntas = async () => {
    if (!producto) return;
    setLoadingPregs(true);
    try { const r = await api.get(`/preguntas/producto/${producto.id}`); setPreguntas(r.data); }
    catch { setPreguntas([]); }
    finally { setLoadingPregs(false); }
  };

  const cargarResenas = async () => {
    if (!producto) return;
    setLoadingResenas(true);
    try {
      const r = await api.get(`/resenas/producto/${producto.id}`);
      setResenas(r.data.resenas || []);
      setPromedioRating(r.data.promedio || 0);
      setTotalResenas(r.data.total || 0);
    } catch { setResenas([]); }
    finally { setLoadingResenas(false); }
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!localStorage.getItem('token')) {
      setSnack({ open: true, msg: 'Inicia sesión para usar la wishlist', severity: 'warning' });
      return;
    }
    setLoadingWish(true);
    try {
      if (enWishlist) {
        await api.delete(`/favoritos/${producto.id}`);
        setEnWishlist(false);
        setSnack({ open: true, msg: 'Quitado de tu wishlist', severity: 'info' });
      } else {
        await api.post(`/favoritos/${producto.id}`);
        setEnWishlist(true);
        setSnack({ open: true, msg: '⭐ Agregado a tu wishlist', severity: 'success' });
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
      setSnack({ open: true, msg: 'Pregunta enviada ✓', severity: 'success' });
    } catch { setSnack({ open: true, msg: 'Error al enviar la pregunta', severity: 'error' }); }
    finally { setEnviando(false); }
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
    } catch { setSnack({ open: true, msg: 'Error al eliminar la pregunta', severity: 'error' }); }
    finally { setEliminandoPregId(null); }
  };

  const handleVerVendedor = () => {
    if (producto?.vendedor?.username) { onClose(); navigate(`/perfil/${producto.vendedor.username}`); }
  };

  if (!producto) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: {
          borderRadius: 4, overflow: 'hidden',
          boxShadow: isDark ? '0 20px 60px rgba(124,58,237,0.3)' : '0 20px 60px rgba(55,48,163,0.15)',
        }}}>

        {/* Imagen portada */}
        <Box sx={{ position: 'relative' }}>
          <Box component="img"
            src={producto.urlArchivo || producto.urlPortada || 'https://via.placeholder.com/600x300?text=Sin+Imagen'}
            alt={producto.titulo}
            sx={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
          />
          <IconButton onClick={onClose}
            sx={{ position: 'absolute', top: 10, right: 10,
              bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
            <CloseIcon />
          </IconButton>
          <Tooltip title={enWishlist ? t.removeWishlist : t.addWishlist}>
            <IconButton onClick={handleToggleWishlist} disabled={loadingWish}
              sx={{
                position: 'absolute', top: 10, left: 10,
                bgcolor: enWishlist ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.92)',
                border: enWishlist ? '2px solid #f59e0b' : '2px solid transparent',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: enWishlist ? 'rgba(245,158,11,0.25)' : 'white', transform: 'scale(1.1)' }
              }}>
              {enWishlist
                ? <StarIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                : <StarBorderIcon sx={{ color: isDark ? '#a78bfa' : '#3730a3', fontSize: 22 }} />}
            </IconButton>
          </Tooltip>

          {/* Badge de rating encima de imagen si hay reseñas */}
          {totalResenas > 0 && (
            <Box sx={{
              position: 'absolute', bottom: 10, right: 10,
              bgcolor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
              borderRadius: 2, px: 1.5, py: 0.5,
              display: 'flex', alignItems: 'center', gap: 0.5,
            }}>
              <StarIcon sx={{ color: '#fbbf24', fontSize: 16 }} />
              <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
                {promedioRating.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                ({totalResenas})
              </Typography>
            </Box>
          )}
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {/* Vendedor */}
          <Tooltip title="Ver perfil del vendedor">
            <Box onClick={handleVerVendedor}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
                cursor: 'pointer', '&:hover': { opacity: 0.75 } }}>
              <Avatar src={producto.vendedor?.fotoUrl}
                sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 'bold' }}>
                {producto.vendedor?.nombreMostrado?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold" color="primary.main"
                  sx={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                  {producto.vendedor?.nombreMostrado || 'Vendedor'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ fontSize: 14, color: '#fbbf24' }} />
                  <Typography variant="caption" color="text.secondary">{t.verifiedSeller}</Typography>
                </Box>
              </Box>
            </Box>
          </Tooltip>

          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.3 }}>
            {producto.titulo}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Chip label={producto.tipo?.replace(/_/g, ' ')} color="primary" size="small" variant="outlined" />
            <Typography variant="h5" color="success.main" fontWeight="bold">${producto.precio}</Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{t.description}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {producto.descripcion || t.noDescription}
          </Typography>

          {/* ── RESEÑAS ── */}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <RateReviewIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight="bold">{t.reviews}</Typography>
            {totalResenas > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                <Rating value={promedioRating} precision={0.1} size="small" readOnly />
                <Typography variant="caption" color="text.secondary">
                  {promedioRating.toFixed(1)} ({totalResenas})
                </Typography>
              </Box>
            )}
          </Box>

          {loadingResenas ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
          ) : resenas.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 1.5 }}>
              {t.noReviews}
            </Typography>
          ) : (
            <Stack spacing={1.5} sx={{ mb: 1 }}>
              {resenas.slice(0, 5).map(r => (
                <Paper key={r.id} variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Avatar src={r.cliente?.fotoUrl}
                      sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'secondary.main', flexShrink: 0 }}>
                      {r.cliente?.nombreMostrado?.charAt(0) || '?'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="caption" fontWeight="bold">
                          {r.cliente?.nombreMostrado || 'Usuario'}
                        </Typography>
                        <Chip label={t.verifiedBuyer} size="small"
                          sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }} />
                        <Rating value={r.calificacion} size="small" readOnly sx={{ ml: 'auto' }} />
                      </Box>
                      {r.comentario && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {r.comentario}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        {r.fechaResena ? new Date(r.fechaResena).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}

          {/* ── PREGUNTAS Y RESPUESTAS ── */}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <QuestionAnswerIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight="bold">{t.qa}</Typography>
            {preguntas.length > 0 && <Chip label={preguntas.length} size="small" color="primary" />}
          </Box>

          {localStorage.getItem('token') && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField fullWidth size="small" placeholder={t.askSeller}
                value={nuevaPregunta} onChange={e => setNuevaPregunta(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviarPregunta(); } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button variant="contained" size="small" onClick={handleEnviarPregunta}
                disabled={enviando || !nuevaPregunta.trim()} sx={{ minWidth: 44, px: 1.5, borderRadius: 2 }}>
                {enviando ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
              </Button>
            </Box>
          )}

          {loadingPregs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
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
                        <Tooltip title={esVendedor && !esAutorPregunta ? 'Eliminar (moderación)' : 'Eliminar mi pregunta'}>
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
                          {p.respondidoPor?.nombreMostrado || 'Vendedor'} · {t.seller || 'Vendedor'}
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
                            {t.cancel}
                          </Button>
                        </Box>
                      ) : (
                        <Button size="small" sx={{ mt: 0.5, ml: 4 }} onClick={() => setRespondiendo(p.id)}>
                          {t.reply}
                        </Button>
                      )
                    )}
                  </Paper>
                );
              })}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" sx={{ flex: 1 }}>{t.close}</Button>
          <Button variant="contained" startIcon={<ShoppingCartIcon />}
            onClick={() => { onClose(); navigate('/detalle-compra', { state: { producto } }); }}
            sx={{ flex: 2, py: 1.2 }}>
            {t.buyNow}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={2500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );
};

export default ProductoModal;
