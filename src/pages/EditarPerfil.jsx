import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Box, Typography, TextField, Button,
  Alert, CircularProgress, Divider, InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SaveIcon       from '@mui/icons-material/Save';
import ArrowBackIcon  from '@mui/icons-material/ArrowBack';
import InstagramIcon  from '@mui/icons-material/Instagram';
import TwitterIcon    from '@mui/icons-material/Twitter';
import LinkedInIcon   from '@mui/icons-material/LinkedIn';
import LanguageIcon   from '@mui/icons-material/Language';
import PhoneIcon      from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from '../services/api';

const EditarPerfil = () => {
  const navigate = useNavigate();
  const [loading,   setLoading]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje,   setMensaje]   = useState('');
  const [esError,   setEsError]   = useState(false);

  const [form, setForm] = useState({
    nombreMostrado: '', email: '', descripcion: '',
    telefono: '', ciudad: '', pais: '',
    sitioWeb: '', instagram: '', twitter: '', linkedin: '',
  });

  useEffect(() => {
    api.get('/users/perfil').then(res => {
      const d = res.data;
      setForm({
        nombreMostrado: d.nombreMostrado || '',
        email:          d.email          || '',
        descripcion:    d.descripcion    || '',
        telefono:       d.telefono       || '',
        ciudad:         d.ciudad         || '',
        pais:           d.pais           || '',
        sitioWeb:       d.sitioWeb       || '',
        instagram:      d.instagram      || '',
        twitter:        d.twitter        || '',
        linkedin:       d.linkedin       || '',
      });
    }).catch(() => setEsError(true))
      .finally(() => setLoading(false));
  }, []);

  const f = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleGuardar = async () => {
    setGuardando(true); setMensaje('');
    try {
      await api.put('/users/perfil', form);
      setMensaje('Perfil actualizado correctamente');
      setEsError(false);
      setTimeout(() => navigate('/perfil'), 1500);
    } catch {
      setMensaje('Error al guardar los cambios'); setEsError(true);
    } finally { setGuardando(false); }
  };

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="sm" sx={{ mt:4, mb:4 }}>
      <Paper elevation={3} sx={{ p:4, borderRadius:3 }}>
        <Box sx={{ display:'flex', alignItems:'center', mb:3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/perfil')}>Volver</Button>
          <Typography variant="h5" fontWeight="bold" sx={{ mx:'auto' }}>Editar Perfil</Typography>
        </Box>

        {mensaje && <Alert severity={esError ? 'error' : 'success'} sx={{ mb:2 }}>{mensaje}</Alert>}

        {/* Info básica */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Información básica</Typography>
        <TextField fullWidth label="Nombre mostrado"   margin="normal" value={form.nombreMostrado} onChange={f('nombreMostrado')} />
        <TextField fullWidth label="Email" type="email" margin="normal" value={form.email}          onChange={f('email')} />
        <TextField fullWidth label="Descripción"       margin="normal" multiline rows={3}
          value={form.descripcion} onChange={f('descripcion')}
          placeholder="Cuéntale a todos quién eres y qué haces..." />

        <Divider sx={{ my:3 }} />

        {/* Datos de contacto */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Datos de contacto</Typography>
        <TextField fullWidth label="Teléfono" margin="normal" value={form.telefono} onChange={f('telefono')}
          InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }} />
        <Box sx={{ display:'flex', gap:2 }}>
          <TextField fullWidth label="Ciudad" margin="normal" value={form.ciudad} onChange={f('ciudad')}
            InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon fontSize="small" /></InputAdornment> }} />
          <TextField fullWidth label="País" margin="normal" value={form.pais} onChange={f('pais')} />
        </Box>

        <Divider sx={{ my:3 }} />

        {/* Redes sociales */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Redes sociales</Typography>
        <TextField fullWidth label="Sitio web" margin="normal" value={form.sitioWeb} onChange={f('sitioWeb')}
          placeholder="https://tuweb.com"
          InputProps={{ startAdornment: <InputAdornment position="start"><LanguageIcon fontSize="small" /></InputAdornment> }} />
        <TextField fullWidth label="Instagram (usuario sin @)" margin="normal" value={form.instagram} onChange={f('instagram')}
          InputProps={{ startAdornment: <InputAdornment position="start"><InstagramIcon fontSize="small" sx={{ color:'#E1306C' }} /></InputAdornment> }} />
        <TextField fullWidth label="Twitter / X (usuario sin @)" margin="normal" value={form.twitter} onChange={f('twitter')}
          InputProps={{ startAdornment: <InputAdornment position="start"><TwitterIcon fontSize="small" sx={{ color:'#1DA1F2' }} /></InputAdornment> }} />
        <TextField fullWidth label="LinkedIn (URL completa)" margin="normal" value={form.linkedin} onChange={f('linkedin')}
          placeholder="https://linkedin.com/in/tuperfil"
          InputProps={{ startAdornment: <InputAdornment position="start"><LinkedInIcon fontSize="small" sx={{ color:'#0A66C2' }} /></InputAdornment> }} />

        <Button fullWidth variant="contained" size="large" startIcon={<SaveIcon />}
          onClick={handleGuardar} disabled={guardando}
          sx={{ mt:3, py:1.5, borderRadius:2, fontWeight:'bold' }}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </Paper>
    </Container>
  );
};

export default EditarPerfil;
