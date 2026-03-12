import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, Avatar,
  CircularProgress, Chip, Badge, Tooltip, Alert
} from '@mui/material';
import SendIcon       from '@mui/icons-material/Send';
import ChatIcon       from '@mui/icons-material/Chat';
import CloseIcon      from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';

const PERIW = '#8B8FC8';

/* ────────────────────────────────────────────────────────────────
   ChatCompra — widget flotante de chat comprador ↔ vendedor
   Props:
     pedidoId       : number
     vendedorNombre : string
     vendedorFoto   : string
     vendedorId     : number  (para saber quién es "el otro")
   ──────────────────────────────────────────────────────────── */
const ChatCompra = ({ pedidoId, vendedorNombre, vendedorFoto, vendedorId }) => {
  const { isDark } = useThemeMode();
  const [open,      setOpen]      = useState(false);
  const [mensajes,  setMensajes]  = useState([]);
  const [texto,     setTexto]     = useState('');
  const [enviando,  setEnviando]  = useState(false);
  const [cargando,  setCargando]  = useState(false);
  const [noLeidos,  setNoLeidos]  = useState(0);
  const [error,     setError]     = useState('');

  const bottomRef = useRef(null);
  const pollRef   = useRef(null);
  const usuarioId = Number(localStorage.getItem('usuarioId'));

  /* ── Cargar mensajes ── */
  const cargar = useCallback(async () => {
    if (!pedidoId) return;
    try {
      const r = await api.get(`/pedidos/${pedidoId}/mensajes`);
      setMensajes(r.data || []);
      if (open) setNoLeidos(0);
    } catch { /* silencioso */ }
  }, [pedidoId, open]);

  /* ── Polling cuando el chat está cerrado ── */
  const cargarNoLeidos = useCallback(async () => {
    if (open || !pedidoId) return;
    try {
      const r = await api.get(`/pedidos/${pedidoId}/mensajes/no-leidos`);
      setNoLeidos(r.data?.noLeidos || 0);
    } catch { /* silencioso */ }
  }, [open, pedidoId]);

  useEffect(() => {
    if (open) {
      cargar();
      pollRef.current = setInterval(cargar, 5000);
    } else {
      clearInterval(pollRef.current);
      cargarNoLeidos();
      pollRef.current = setInterval(cargarNoLeidos, 15000);
    }
    return () => clearInterval(pollRef.current);
  }, [open, cargar, cargarNoLeidos]);

  /* ── Scroll al fondo ── */
  useEffect(() => {
    if (open && mensajes.length) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [mensajes, open]);

  const handleAbrir = async () => {
    setOpen(true);
    setNoLeidos(0);
  };

  /* ── Enviar ── */
  const handleEnviar = async (e) => {
    e?.preventDefault();
    const txt = texto.trim();
    if (!txt || enviando) return;
    setEnviando(true);
    setError('');
    try {
      await api.post(`/pedidos/${pedidoId}/mensajes`, { texto: txt });
      setTexto('');
      await cargar();
    } catch {
      setError('No se pudo enviar el mensaje. Intenta de nuevo.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setEnviando(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar(); }
  };

  const fmtHora = (d) => d
    ? new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    : '';

  /* ── Colores ── */
  const BG_CHAT  = isDark ? '#0D1127' : '#F5F5F2';
  const BG_CARD  = isDark ? '#141929' : '#FFFFFF';
  const BG_MINE  = PERIW;
  const BG_OTHER = isDark ? '#1E2A45' : '#E8E9F0';

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Botón flotante abrir/cerrar */}
      <Tooltip title={open ? 'Cerrar chat' : `Chat con ${vendedorNombre || 'vendedor'}`}>
        <IconButton
          onClick={open ? () => setOpen(false) : handleAbrir}
          sx={{
            backgroundColor: PERIW,
            color: '#fff',
            width: 48, height: 48,
            boxShadow: '0 4px 16px rgba(139,143,200,0.45)',
            '&:hover': { backgroundColor: '#6B6FAE', transform: 'scale(1.05)' },
            transition: 'all 0.2s',
          }}
        >
          <Badge badgeContent={!open ? noLeidos : 0} color="error" overlap="circular">
            {open ? <CloseIcon /> : <ChatIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Panel del chat */}
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute', bottom: 60, right: 0,
            width: 320, borderRadius: 3, overflow: 'hidden',
            zIndex: 1000,
            border: isDark ? '1px solid rgba(200,202,212,0.10)' : '1px solid #E0E0D8',
            boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box sx={{
            background: `linear-gradient(135deg, #0D1127, ${PERIW})`,
            px: 2, py: 1.5,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <Avatar src={vendedorFoto} sx={{ width: 34, height: 34, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
              {vendedorNombre?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="bold" sx={{ color: '#fff', lineHeight: 1.2 }}>
                {vendedorNombre || 'Vendedor'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                Chat del pedido
              </Typography>
            </Box>
            <Chip label="Live" size="small" sx={{
              bgcolor: '#34D399', color: '#fff', height: 18, fontSize: '0.6rem', fontWeight: 700,
            }} />
          </Box>

          {/* Mensajes */}
          <Box sx={{
            height: 280, overflowY: 'auto', p: 1.5,
            background: BG_CHAT,
            display: 'flex', flexDirection: 'column', gap: 1,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { background: PERIW, borderRadius: 2 },
          }}>
            {cargando ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <CircularProgress size={24} sx={{ color: PERIW }} />
              </Box>
            ) : mensajes.length === 0 ? (
              <Box sx={{ textAlign: 'center', pt: 4 }}>
                <ChatIcon sx={{ fontSize: 36, color: 'rgba(139,143,200,0.3)', mb: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block">
                  Aún no hay mensajes
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inicia la conversación con {vendedorNombre}
                </Typography>
              </Box>
            ) : (
              mensajes.map((msg) => {
                const esMio = msg.remitente?.id === usuarioId;
                return (
                  <Box key={msg.id} sx={{
                    display: 'flex',
                    flexDirection: esMio ? 'row-reverse' : 'row',
                    alignItems: 'flex-end', gap: 0.75,
                  }}>
                    {!esMio && (
                      <Avatar src={msg.remitente?.fotoUrl}
                        sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: PERIW, flexShrink: 0 }}>
                        {msg.remitente?.nombreMostrado?.charAt(0)}
                      </Avatar>
                    )}
                    <Box sx={{ maxWidth: '75%' }}>
                      <Box sx={{
                        px: 1.5, py: 1,
                        borderRadius: esMio ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        backgroundColor: esMio ? BG_MINE : BG_OTHER,
                        color: esMio ? '#fff' : (isDark ? '#E8E9F0' : '#0D1127'),
                      }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.45, wordBreak: 'break-word' }}>
                          {msg.texto}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{
                        display: 'block',
                        textAlign: esMio ? 'right' : 'left',
                        color: 'text.secondary',
                        mt: 0.25, fontSize: '0.62rem',
                      }}>
                        {fmtHora(msg.fechaEnvio)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
            {error && <Alert severity="error" sx={{ borderRadius: 2, fontSize: '0.75rem' }}>{error}</Alert>}
            <div ref={bottomRef} />
          </Box>

          {/* Input */}
          <Box component="form" onSubmit={handleEnviar} sx={{
            display: 'flex', gap: 1, p: 1.5,
            background: BG_CARD,
            borderTop: `1px solid ${isDark ? 'rgba(200,202,212,0.08)' : '#E0E0D8'}`,
          }}>
            <TextField
              fullWidth multiline maxRows={3}
              placeholder="Escribe un mensaje..."
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={handleKey}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontSize: '0.85rem',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,17,39,0.04)',
                  '& fieldset': { borderColor: isDark ? 'rgba(200,202,212,0.12)' : 'rgba(13,17,39,0.12)' },
                  '&.Mui-focused fieldset': { borderColor: PERIW },
                },
                '& .MuiOutlinedInput-input': { color: isDark ? '#E8E9F0' : '#0D1127' },
              }}
            />
            <IconButton type="submit" disabled={!texto.trim() || enviando}
              sx={{
                bgcolor: PERIW, color: '#fff', width: 38, height: 38,
                borderRadius: 2, flexShrink: 0, alignSelf: 'flex-end',
                '&:hover': { bgcolor: '#6B6FAE' },
                '&:disabled': { bgcolor: 'rgba(139,143,200,0.3)', color: '#fff' },
              }}>
              {enviando ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ChatCompra;
