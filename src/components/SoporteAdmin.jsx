import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, Avatar,
  Badge, List, ListItem, ListItemAvatar, ListItemText,
  Divider, CircularProgress, Chip, Tabs, Tab, Tooltip,
  Alert, Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useThemeMode } from '../ThemeContext';
import api from '../services/api';
import { BRAND_NAVY, BRAND_NAVY_TOP, BRAND_PERIW, BRAND_BORDER } from '../brandColors';

const SoporteAdmin = () => {
  const { isDark } = useThemeMode();
  const [tab, setTab] = useState(0);

  // Chat con usuarios registrados
  const [chats, setChats] = useState([]);
  const [chatActivo, setChatActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  // Mensajes de contacto (visitantes)
  const [contactos, setContactos] = useState([]);
  const [loadingContactos, setLoadingContactos] = useState(false);

  const adminId = localStorage.getItem('usuarioId');

  const cargarChats = async () => {
    try { const r = await api.get('/soporte/admin/chats'); setChats(r.data); } catch {}
  };

  const cargarConversacion = async (usuarioId, silencioso = false) => {
    try {
      const r = await api.get(`/soporte/admin/chat/${usuarioId}`);
      setMensajes(r.data);
      if (!silencioso) cargarChats();
    } catch {}
  };

  const cargarContactos = async () => {
    setLoadingContactos(true);
    try { const r = await api.get('/soporte/admin/contactos'); setContactos(r.data); } catch {}
    finally { setLoadingContactos(false); }
  };

  useEffect(() => {
    cargarChats();
    cargarContactos();
    pollRef.current = setInterval(() => {
      cargarChats();
      if (chatActivo) cargarConversacion(chatActivo.id, true);
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [chatActivo]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleSeleccionarChat = async (usuario) => {
    setChatActivo(usuario);
    await cargarConversacion(usuario.id);
  };

  const handleEnviar = async () => {
    if (!texto.trim() || !chatActivo || enviando) return;
    setEnviando(true);
    try {
      await api.post('/soporte/chat/enviar', { texto, destinatarioId: chatActivo.id });
      setTexto('');
      await cargarConversacion(chatActivo.id, true);
    } catch {}
    finally { setEnviando(false); }
  };

  const handleMarcarLeido = async (id) => {
    try {
      await api.put(`/soporte/admin/contactos/${id}/leido`);
      cargarContactos();
    } catch {}
  };

  const handleEliminarContacto = async (id) => {
    try {
      await api.delete(`/soporte/admin/contactos/${id}`);
      cargarContactos();
    } catch {}
  };

  const noLeidosContactos = contactos.filter(c => !c.leido).length;
  const noLeidosChats = chats.reduce((s, c) => s + (c.noLeidos || 0), 0);

  return (
    <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mt: 3 }}>
      {/* Encabezado */}
      <Box sx={{
        background: `linear-gradient(90deg, ${BRAND_NAVY_TOP} 0%, ${BRAND_NAVY} 100%)`,
        px: 3, py: 2,
        borderBottom: `1px solid ${BRAND_BORDER}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <ChatBubbleOutlineIcon sx={{ color: BRAND_PERIW, fontSize: 26 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
            Soporte Técnico
          </Typography>
        </Box>
      </Box>

      <Tabs
        value={tab} onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}
      >
        <Tab label={
          <Badge badgeContent={noLeidosChats} color="error" sx={{ pr: noLeidosChats ? 1.5 : 0 }}>
            Chats de usuarios
          </Badge>
        } />
        <Tab label={
          <Badge badgeContent={noLeidosContactos} color="error" sx={{ pr: noLeidosContactos ? 1.5 : 0 }}>
            Mensajes de visitantes
          </Badge>
        } />
      </Tabs>

      {/* ── PANEL CHATS ── */}
      {tab === 0 && (
        <Box sx={{ display: 'flex', height: 500 }}>

          {/* Lista de usuarios */}
          <Box sx={{
            width: 240, borderRight: 1, borderColor: 'divider',
            overflowY: 'auto', flexShrink: 0,
          }}>
            {chats.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Aún no hay conversaciones
                </Typography>
              </Box>
            ) : chats.map(c => (
              <ListItem
                key={c.id} button
                onClick={() => handleSeleccionarChat(c)}
                selected={chatActivo?.id === c.id}
                sx={{
                  cursor: 'pointer',
                  bgcolor: chatActivo?.id === c.id
                    ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)')
                    : 'transparent',
                  '&:hover': { bgcolor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)' },
                  borderBottom: '1px solid', borderColor: 'divider',
                  py: 1.5,
                }}
              >
                <ListItemAvatar>
                  <Badge variant="dot" color="error" invisible={!c.noLeidos}>
                    <Avatar src={c.fotoUrl} sx={{ width: 36, height: 36, bgcolor: '#6366f1', fontSize: '0.9rem' }}>
                      {!c.fotoUrl && (c.nombreMostrado?.charAt(0) || '?')}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={c.noLeidos ? 'bold' : 'normal'} noWrap>
                      {c.nombreMostrado}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {c.ultimoMensaje || '@' + c.username}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </Box>

          {/* Área de chat */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!chatActivo ? (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Selecciona una conversación</Typography>
              </Box>
            ) : (
              <>
                {/* Header conversación */}
                <Box sx={{
                  px: 2, py: 1.2, borderBottom: 1, borderColor: 'divider',
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  bgcolor: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
                }}>
                  <Avatar src={chatActivo.fotoUrl} sx={{ width: 32, height: 32, bgcolor: '#6366f1' }}>
                    {!chatActivo.fotoUrl && chatActivo.nombreMostrado?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{chatActivo.nombreMostrado}</Typography>
                    <Typography variant="caption" color="text.secondary">@{chatActivo.username}</Typography>
                  </Box>
                  <Chip label={chatActivo.role === 'SELLER' ? 'Vendedor' : 'Usuario'} size="small" sx={{ ml: 'auto' }} />
                </Box>

                {/* Mensajes */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {mensajes.map(msg => {
                    const esMio = String(msg.remitente?.id) === String(adminId);
                    return (
                      <Box key={msg.id} sx={{ display: 'flex', justifyContent: esMio ? 'flex-end' : 'flex-start' }}>
                        <Box sx={{
                          maxWidth: '75%', px: 1.5, py: 1,
                          borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: esMio
                            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                            : isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                          color: esMio ? 'white' : 'text.primary',
                        }}>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{msg.texto}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.65, fontSize: '0.65rem', display: 'block', textAlign: 'right', mt: 0.25 }}>
                            {msg.fechaEnvio ? new Date(msg.fechaEnvio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={bottomRef} />
                </Box>

                <Divider />
                {/* Input respuesta */}
                <Box sx={{ px: 1.5, py: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    fullWidth size="small" placeholder={`Responder a ${chatActivo.nombreMostrado}...`}
                    value={texto} onChange={e => setTexto(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar(); } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  <IconButton
                    onClick={handleEnviar}
                    disabled={!texto.trim() || enviando}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                      width: 38, height: 38, flexShrink: 0,
                      '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
                      '&.Mui-disabled': { background: 'rgba(0,0,0,0.12)', color: 'rgba(0,0,0,0.26)' },
                    }}
                  >
                    {enviando ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
                  </IconButton>
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* ── PANEL CONTACTOS (visitantes) ── */}
      {tab === 1 && (
        <Box sx={{ p: 2, maxHeight: 500, overflowY: 'auto' }}>
          {loadingContactos ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>
          ) : contactos.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>No hay mensajes de visitantes aún</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {contactos.map(c => (
                <Paper key={c.id} variant="outlined" sx={{
                  p: 2, borderRadius: 2,
                  borderColor: !c.leido ? '#6366f1' : 'divider',
                  bgcolor: !c.leido
                    ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)')
                    : 'transparent',
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight="bold">{c.nombre}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                        <Typography variant="body2" color="primary" component="a" href={`mailto:${c.email}`} sx={{ textDecoration: 'none' }}>
                          {c.email}
                        </Typography>
                      </Box>
                      {c.telefono && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                          <Typography variant="body2">{c.telefono}</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      {!c.leido && (
                        <Tooltip title="Marcar como leído">
                          <IconButton size="small" color="primary" onClick={() => handleMarcarLeido(c.id)}>
                            <MarkEmailReadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => handleEliminarContacto(c.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                    borderRadius: 1.5, p: 1.5, mb: 1,
                    borderLeft: '3px solid #6366f1',
                  }}>
                    {c.mensaje}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {c.fechaEnvio ? new Date(c.fechaEnvio).toLocaleString('es-MX') : ''}
                    </Typography>
                    <Chip
                      label={c.leido ? 'Leído' : 'Nuevo'}
                      size="small"
                      color={c.leido ? 'default' : 'primary'}
                      variant={c.leido ? 'outlined' : 'filled'}
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default SoporteAdmin;
