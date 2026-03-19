import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const TIPOS = [
  { value: 'SERVICIO_GIG',        label: 'Servicio / Gig' },
  { value: 'CURSO_DIGITAL',       label: 'Curso Digital' },
  { value: 'RECURSO_DESCARGABLE', label: 'Recurso Descargable' },
  { value: 'SUSCRIPCION',         label: 'Suscripción' },
  { value: 'PRODUCTO_FISICO',     label: 'Producto Físico' },
  { value: 'CONSULTORIA',         label: 'Consultoría' },
  { value: 'DISENO_GRAFICO',      label: 'Diseño Gráfico' },
  { value: 'DESARROLLO_WEB',      label: 'Desarrollo Web' },
  { value: 'MARKETING_DIGITAL',   label: 'Marketing Digital' },
  { value: 'MUSICA_AUDIO',        label: 'Música / Audio' },
];

const CrearProducto = () => {
  const navigate = useNavigate();
  const rol = localStorage.getItem('usuarioRol');

  const [titulo,       setTitulo]       = useState('');
  const [precio,       setPrecio]       = useState('');
  const [descripcion,  setDescripcion]  = useState('');
  const [tipo,         setTipo]         = useState('SERVICIO_GIG');
  const [portada,      setPortada]      = useState(null);
  const [portadaPreview,setPortadaPreview]= useState(null);
  const [mensaje,      setMensaje]      = useState('');
  const [esError,      setEsError]      = useState(false);
  const [cargando,     setCargando]     = useState(false);

  useEffect(() => {
    if (rol !== 'SELLER' && rol !== 'ADMIN') {
      setEsError(true);
      setMensaje('Debes ser Vendedor para publicar. Solicita ser vendedor desde tu perfil.');
    }
  }, [rol]);

  const handlePortadaChange = e => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPortada(file);
      setPortadaPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje(''); setEsError(false);
    if (rol !== 'SELLER' && rol !== 'ADMIN') {
      setEsError(true); setMensaje('Debes ser Vendedor para publicar.'); return;
    }
    if (!titulo || !precio || !descripcion || !portada) {
      setEsError(true); setMensaje('Todos los campos y la imagen de portada son obligatorios.'); return;
    }
    setCargando(true);
    const formData = new FormData();
    formData.append('titulo',      titulo);
    formData.append('precio',      precio);
    formData.append('descripcion', descripcion);
    formData.append('tipo',        tipo);
    formData.append('archivo',     portada);
    formData.append('portada',     portada);

    try {
      await api.post('/productos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEsError(false);
      setMensaje('¡Producto publicado exitosamente!');
      setTimeout(() => navigate('/home'), 1200);
    } catch (err) {
      setEsError(true);
      if (err.response?.status === 403) setMensaje('No tienes permiso. Asegúrate de ser Vendedor.');
      else setMensaje('Error al subir el producto: ' + (err.response?.data || err.message));
    } finally { setCargando(false); }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p:4, mt:5, borderRadius:3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
          Publicar Nuevo Gig
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Sube tu trabajo y empieza a ganar dinero
        </Typography>

        {mensaje && <Alert severity={esError ? 'error' : 'success'} sx={{ mb:2 }}>{mensaje}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Título del Servicio" margin="normal"
            value={titulo} onChange={e => setTitulo(e.target.value)} />

          <Box sx={{ display:'flex', gap:2 }}>
            <TextField fullWidth label="Precio ($)" type="number" margin="normal"
              value={precio} onChange={e => setPrecio(e.target.value)} />
            <TextField select fullWidth label="Categoría" margin="normal"
              value={tipo} onChange={e => setTipo(e.target.value)}>
              {TIPOS.map(t => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField fullWidth label="Descripción detallada" multiline rows={4} margin="normal"
            value={descripcion} onChange={e => setDescripcion(e.target.value)} />

          <Button variant="outlined" component="label" fullWidth
            startIcon={<CloudUploadIcon />}
            sx={{ mt:2, mb:1, height:50, borderStyle:'dashed' }}>
            {portada ? portada.name : '📷 Subir Imagen de Portada *'}
            <input type="file" hidden accept="image/*" onChange={handlePortadaChange} />
          </Button>

          {portadaPreview && (
            <Box sx={{ mb:2, textAlign:'center' }}>
              <img src={portadaPreview} alt="preview"
                style={{ maxHeight:180, maxWidth:'100%', borderRadius:8, objectFit:'cover' }} />
            </Box>
          )}

          <Button type="submit" variant="contained" color="primary" fullWidth size="large"
            disabled={cargando || (rol !== 'SELLER' && rol !== 'ADMIN')}
            sx={{ mt:2, fontWeight:'bold' }}>
            {cargando ? 'Publicando...' : 'Publicar Ahora'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CrearProducto;
