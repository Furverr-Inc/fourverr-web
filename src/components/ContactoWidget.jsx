import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton,
  Fab, CircularProgress, Alert, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useThemeMode } from '../ThemeContext';
import api from '../services/api';

const ContactoWidget = () => {
  const { isDark } = useThemeMode();
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
      setError(err.response?.data || 'Error al enviar. Intenta de nuevo.');
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
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(99,102,241,0.5)',
          '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
        }}
      >
        <SupportAgentIcon />
      </Fab>

      {abierto && (
        <Paper elevation={8} sx={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 1300,
          width: 340, borderRadius: 3, overflow: 'hidden',
          border: isDark ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.15)',
          boxShadow: '0 20px 60px rgba(99,102,241,0.25)',
        }}>

          {/* Header */}
          <Box sx={{
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            px: 2, py: 1.5,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
                <CheckCircleIcon sx={{ fontSize: 52, color: 'success.main', mb: 1 }} />
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
                    borderRadius: 2, py: 1,
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    '&:hover': { background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' },
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
