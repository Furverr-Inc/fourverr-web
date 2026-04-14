import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton,
  Fab, CircularProgress, Alert, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '../services/api';
import {
  BRAND_NAVY, BRAND_NAVY_TOP, BRAND_PERIW, BRAND_PERIW_HOVER, BRAND_BORDER, BRAND_SHADOW,
} from '../brandColors';

const ContactoWidget = () => {
  const [abierto, setAbierto] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });

  const set = (campo) => (e) => setForm(f => ({ ...f, [campo]: e.target.value }));

  const handleEnviar = async () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      setError('Nombre, email y mensaje son obligatorios');
      return;
    }
    setError('');
    setEnviando(true);
    try {
      await api.post('/soporte/contacto', form);
      setEnviado(true);
    } catch (err) {
      const d = err.response?.data;
      const msg = typeof d === 'string' ? d : (d?.message || 'Error al enviar. Intenta de nuevo.');
      setError(msg);
    } finally { setEnviando(false); }
  };

  const handleCerrar = () => {
    setAbierto(false);
    setTimeout(() => { setEnviado(false); setForm({ nombre: '', email: '', telefono: '', mensaje: '' }); setError(''); }, 300);
  };

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
          '&:hover': { background: BRAND_NAVY, color: '#fff' },
        }}
      >
        <ChatBubbleOutlineIcon sx={{ fontSize: 26 }} />
      </Fab>

      {abierto && (
        <Paper elevation={8} sx={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 1300,
          width: 340, borderRadius: 3, overflow: 'hidden',
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
            <Box>
              <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
                ¿Necesitas ayuda?
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Déjanos tus datos y te contactamos
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleCerrar} sx={{ color: 'white' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 2 }}>
            {enviado ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 52, color: 'success.main', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">¡Mensaje enviado!</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Te contactaremos pronto al correo proporcionado.
                </Typography>
                <Button variant="outlined" sx={{ mt: 2, borderRadius: 2 }} onClick={handleCerrar}>
                  Cerrar
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {error && <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }}>{error}</Alert>}

                <TextField
                  label="Nombre *" fullWidth size="small" value={form.nombre} onChange={set('nombre')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="Correo electrónico *" fullWidth size="small" type="email"
                  value={form.email} onChange={set('email')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="Teléfono (opcional)" fullWidth size="small"
                  value={form.telefono} onChange={set('telefono')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="¿En qué podemos ayudarte? *" fullWidth size="small"
                  multiline rows={3} value={form.mensaje} onChange={set('mensaje')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <Button
                  variant="contained" fullWidth endIcon={enviando ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                  disabled={enviando}
                  onClick={handleEnviar}
                  sx={{
                    borderRadius: '50px', py: 1,
                    bgcolor: BRAND_PERIW,
                    '&:hover': { bgcolor: BRAND_PERIW_HOVER },
                  }}
                >
                  {enviando ? 'Enviando...' : 'Enviar mensaje'}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ContactoWidget;
