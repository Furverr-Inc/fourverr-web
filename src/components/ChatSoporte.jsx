import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, Avatar,
  Badge, Fab, CircularProgress, Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useThemeMode } from '../ThemeContext';
import api from '../services/api';
import { BRAND_NAVY, BRAND_NAVY_TOP, BRAND_PERIW, BRAND_BORDER, BRAND_SHADOW } from '../brandColors';

const ChatSoporte = () => {
  const { isDark } = useThemeMode();
  const [abierto, setAbierto]       = useState(false);
  const [mensajes, setMensajes]     = useState([]);
  const [texto, setTexto]           = useState('');
  const [enviando, setEnviando]     = useState(false);
  const [noLeidos, setNoLeidos]     = useState(0);
  const [loading, setLoading]       = useState(false);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Tú';

  const cargarMensajes = async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    try {
      const res = await api.get('/soporte/chat/mi-conversacion');
      setMensajes(res.data);
      setNoLeidos(0);
    } catch {}
    finally { if (!silencioso) setLoading(false); }
  };

  const cargarNoLeidos = async () => {
    try {
      const res = await api.get('/soporte/chat/no-leidos');
      setNoLeidos(res.data.count);
    } catch {}
  };

  // Poll cada 8s cuando el chat está cerrado, cada 4s cuando está abierto
  useEffect(() => {
    cargarNoLeidos();
    pollRef.current = setInterval(() => {
      if (abierto) cargarMensajes(true);
      else cargarNoLeidos();
    }, abierto ? 4000 : 8000);
    return () => clearInterval(pollRef.current);
  }, [abierto]);

  useEffect(() => {
    if (abierto) cargarMensajes();
  }, [abierto]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async () => {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    try {
      await api.post('/soporte/chat/enviar', { texto });
      setTexto('');
      await cargarMensajes(true);
    } catch {}
    finally { setEnviando(false); }
  };

  const miId = localStorage.getItem('usuarioId');

  return (
    <>
      {/* Burbuja flotante */}
      <Fab
        onClick={() => setAbierto(o => !o)}
        sx={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1300,
          background: `linear-gradient(145deg, ${BRAND_NAVY_TOP} 0%, ${BRAND_NAVY} 100%)`,
          color: BRAND_PERIW,
          boxShadow: `0 8px 28px ${BRAND_SHADOW}`,
          border: `1px solid ${BRAND_BORDER}`,
          '&:hover': {
            background: BRAND_NAVY,
            color: '#fff',
          },
        }}
      >
        <Badge badgeContent={noLeidos} color="error" max={9}>
          <ChatBubbleOutlineIcon sx={{ fontSize: 26 }} />
        </Badge>
      </Fab>

      {/* Ventana de chat */}
      {abierto && (
        <Paper elevation={8} sx={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 1300,
          width: 340, height: 460,
          borderRadius: 3, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          border: `1px solid ${BRAND_BORDER}`,
          boxShadow: `0 20px 60px ${BRAND_SHADOW}`,
        }}>

          {/* Header */}
          <Box sx={{
            background: `linear-gradient(90deg, ${BRAND_NAVY_TOP} 0%, ${BRAND_NAVY} 100%)`,
            px: 2, py: 1.5,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${BRAND_BORDER}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(139,143,200,0.25)' }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: BRAND_PERIW }} />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ color: 'white', lineHeight: 1.2 }}>
                  Soporte Zento
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                  Normalmente responde en minutos
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setAbierto(false)} sx={{ color: 'white' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Mensajes */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : mensajes.length === 0 ? (
              <Box sx={{ textAlign: 'center', pt: 4 }}>
                <SupportAgentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  ¡Hola! ¿En qué podemos ayudarte?
                </Typography>
              </Box>
            ) : (
              mensajes.map(msg => {
                const esMio = String(msg.remitente?.id) === String(miId);
                return (
                  <Box key={msg.id} sx={{ display: 'flex', justifyContent: esMio ? 'flex-end' : 'flex-start' }}>
                    <Box sx={{
                      maxWidth: '78%', px: 1.5, py: 1, borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: esMio
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                      color: esMio ? 'white' : 'text.primary',
                    }}>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{msg.texto}</Typography>
                      <Typography variant="caption" sx={{
                        opacity: 0.65, fontSize: '0.65rem', display: 'block', textAlign: 'right', mt: 0.25
                      }}>
                        {msg.fechaEnvio ? new Date(msg.fechaEnvio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
            <div ref={bottomRef} />
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{ px: 1.5, py: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth size="small" placeholder="Escribe un mensaje..."
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar(); } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <IconButton
              onClick={handleEnviar}
              disabled={!texto.trim() || enviando}
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', width: 38, height: 38, flexShrink: 0,
                '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
                '&.Mui-disabled': { background: 'action.disabledBackground', color: 'text.disabled' },
              }}
            >
              {enviando ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatSoporte;
