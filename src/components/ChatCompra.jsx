import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, Avatar,
  CircularProgress, Chip, Badge, Tooltip, Alert, Button
} from '@mui/material';
import SendIcon       from '@mui/icons-material/Send';
import ChatIcon       from '@mui/icons-material/Chat';
import CloseIcon      from '@mui/icons-material/Close';
import MinimizeIcon   from '@mui/icons-material/Remove';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import { createPortal } from 'react-dom';

const PERIW = '#8B8FC8';

/* ────────────────────────────────────────────────────────────────
   ChatCompra — chat comprador ↔ vendedor por pedido
   El panel se renderiza con position:fixed en la esquina inferior
   derecha de la pantalla usando un Portal, sin quedar cortado.

   Props:
     pedidoId       : number
     vendedorNombre : string
     vendedorFoto   : string (url)
     vendedorId     : number
     chatIndex      : number  (para separar múltiples chats abiertos)
   ──────────────────────────────────────────────────────────── */
const ChatCompra = ({ pedidoId, vendedorNombre, vendedorFoto, vendedorId, chatIndex = 0 }) => {
  const { isDark } = useThemeMode();
  const [open,     setOpen]     = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [texto,    setTexto]    = useState('');
  const [enviando, setEnviando] = useState(false);
  const [noLeidos, setNoLeidos] = useState(0);
  const [error,    setError]    = useState('');

  const bottomRef = useRef(null);
  const pollRef   = useRef(null);
  const usuarioId = Number(localStorage.getItem('usuarioId'));

  /* ── Cargar mensajes ── */
  const cargar = useCallback(async () => {
    if (!pedidoId) return;
    try {
      const r = await api.get(`/pedidos/${pedidoId}/mensajes`);
      setMensajes(r.data || []);
    } catch { /* silencioso */ }
  }, [pedidoId]);

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
      setNoLeidos(0);
      pollRef.current = setInterval(cargar, 5000);
    } else {
      clearInterval(pollRef.current);
      cargarNoLeidos();
      pollRef.current = setInterval(cargarNoLeidos, 15000);
    }
    return () => clearInterval(pollRef.current);
  }, [open, cargar, cargarNoLeidos]);

  useEffect(() => {
    if (open && mensajes.length) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [mensajes, open]);

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
      setError('No se pudo enviar.');
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

  /* ── Posición del panel — múltiples chats apilados ── */
  const rightOffset  = 20 + chatIndex * 340;

  /* ── Colores ── */
  const BG_CHAT  = isDark ? '#0D1127' : '#F0F0F0';
  const BG_CARD  = isDark ? '#141929' : '#FFFFFF';
  const BG_MINE  = PERIW;
  const BG_OTHER = isDark ? '#1E2A45' : '#E2E3EF';

  /* ── Panel renderizado via Portal (fixed al viewport) ── */
  const chatPanel = open ? createPortal(
    <Paper
      elevation={12}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: rightOffset,
        width: 320,
        height: 440,
        borderRadius: 3,
        overflow: 'hidden',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        border: isDark ? '1px solid rgba(200,202,212,0.12)' : '1px solid #D8D9E8',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, #0D1127 0%, ${PERIW} 100%)`,
        px: 2, py: 1.5,
        display: 'flex', alignItems: 'center', gap: 1.5,
        flexShrink: 0,
      }}>
        <Avatar src={vendedorFoto} sx={{ width: 34, height: 34, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
          {vendedorNombre?.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight="bold" noWrap sx={{ color: '#fff', lineHeight: 1.2 }}>
            {vendedorNombre || 'Vendedor'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Chat del pedido #{pedidoId}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => setOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.7)', p: 0.5, '&:hover': { color: '#fff' } }}>
            <MinimizeIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.7)', p: 0.5, '&:hover': { color: '#fff' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Mensajes */}
      <Box sx={{
        flex: 1, overflowY: 'auto', p: 1.5,
        background: BG_CHAT,
        display: 'flex', flexDirection: 'column', gap: 1,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: PERIW, borderRadius: 2 },
      }}>
        {mensajes.length === 0 ? (
          <Box sx={{ textAlign: 'center', pt: 3 }}>
            <ChatIcon sx={{ fontSize: 40, color: 'rgba(139,143,200,0.25)', mb: 1 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Aún no hay mensajes
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(139,143,200,0.5)' }}>
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
                    sx={{ width: 22, height: 22, fontSize: '0.6rem', bgcolor: PERIW, flexShrink: 0 }}>
                    {msg.remitente?.nombreMostrado?.charAt(0)}
                  </Avatar>
                )}
                <Box sx={{ maxWidth: '78%' }}>
                  <Box sx={{
                    px: 1.5, py: 0.8,
                    borderRadius: esMio ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    backgroundColor: esMio ? BG_MINE : BG_OTHER,
                    color: esMio ? '#fff' : (isDark ? '#E8E9F0' : '#0D1127'),
                  }}>
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                      {msg.texto}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{
                    display: 'block',
                    textAlign: esMio ? 'right' : 'left',
                    color: 'text.secondary', mt: 0.2, fontSize: '0.6rem',
                  }}>
                    {fmtHora(msg.fechaEnvio)}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        {error && <Alert severity="error" sx={{ borderRadius: 2, fontSize: '0.72rem', py: 0 }}>{error}</Alert>}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box component="form" onSubmit={handleEnviar} sx={{
        display: 'flex', gap: 1, p: 1.2,
        background: BG_CARD,
        borderTop: `1px solid ${isDark ? 'rgba(200,202,212,0.08)' : '#E0E0D8'}`,
        flexShrink: 0,
      }}>
        <TextField
          fullWidth multiline maxRows={3} size="small"
          placeholder="Escribe un mensaje..."
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={handleKey}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3, fontSize: '0.82rem',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F2',
              '& fieldset': { borderColor: isDark ? 'rgba(200,202,212,0.10)' : '#DCDDE8' },
              '&.Mui-focused fieldset': { borderColor: PERIW },
            },
            '& .MuiOutlinedInput-input': { color: isDark ? '#E8E9F0' : '#0D1127', py: 0.8 },
          }}
        />
        <IconButton type="submit" disabled={!texto.trim() || enviando}
          sx={{
            bgcolor: PERIW, color: '#fff', width: 36, height: 36,
            borderRadius: 2, flexShrink: 0, alignSelf: 'flex-end',
            '&:hover': { bgcolor: '#6B6FAE' },
            '&:disabled': { bgcolor: 'rgba(139,143,200,0.25)', color: 'rgba(255,255,255,0.5)' },
          }}>
          {enviando ? <CircularProgress size={14} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
        </IconButton>
      </Box>
    </Paper>,
    document.body
  ) : null;

  /* ── Botón que va dentro de la card ── */
  return (
    <>
      <Tooltip title={`Chat con ${vendedorNombre || 'vendedor'}`} placement="top">
        <Button
          size="small"
          variant={open ? 'contained' : 'outlined'}
          startIcon={
            <Badge badgeContent={!open ? noLeidos : 0} color="error">
              <ChatIcon sx={{ fontSize: '15px !important' }} />
            </Badge>
          }
          onClick={() => setOpen(o => !o)}
          sx={{
            borderRadius: 2,
            fontSize: '0.7rem',
            py: 0.4, px: 1.2,
            textTransform: 'none',
            fontWeight: 600,
            ...(open
              ? { bgcolor: PERIW, color: '#fff', borderColor: PERIW, '&:hover': { bgcolor: '#6B6FAE' } }
              : { borderColor: PERIW, color: PERIW, '&:hover': { bgcolor: 'rgba(139,143,200,0.08)' } }
            ),
          }}
        >
          Chat
        </Button>
      </Tooltip>

      {chatPanel}
    </>
  );
};

export default ChatCompra;
