import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const CrearProducto = () => {
  const navigate = useNavigate();
  
  // Estados
  const [titulo, setTitulo] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('ILUSTRACION'); // Valor por defecto del ENUM
  const [archivo, setArchivo] = useState(null);
  
  // UI States
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);
    
    if (!titulo || !precio || !archivo || !descripcion) {
      setEsError(true);
      setMensaje("Todos los campos y la imagen son obligatorios.");
      return;
    }

    setCargando(true);
    
    // PREPARAR DATOS PARA ENVÍO (MULTIPART)
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('precio', precio);
    formData.append('descripcion', descripcion);
    formData.append('tipo', tipo);
    // IMPORTANTE: 'archivo' debe coincidir con @RequestParam("archivo") en Java
    formData.append('archivo', archivo); 

    try {
      // La URL debe coincidir con tu Controller
      await api.post('/productos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("¡Producto publicado exitosamente!");
      navigate('/home');

    } catch (err) {
      console.error(err);
      setEsError(true);
      // Verificamos si es un error de permisos (403)
      if (err.response && err.response.status === 403) {
        setMensaje("No tienes permiso. Asegúrate de ser Vendedor.");
      } else {
        setMensaje("Error al subir el producto. Intenta de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
          Publicar Nuevo Gig
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Sube tu trabajo a Amazon S3 y empieza a vender.
        </Typography>

        {mensaje && <Alert severity={esError ? "error" : "success"} sx={{ mb: 2 }}>{mensaje}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Título del Servicio" margin="normal"
            value={titulo} onChange={(e) => setTitulo(e.target.value)}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth label="Precio ($)" type="number" margin="normal"
              value={precio} onChange={(e) => setPrecio(e.target.value)}
            />
            
            {/* SELECTOR DE TIPO (Crucial para Java Enum) */}
            <TextField
              select fullWidth label="Categoría" margin="normal"
              value={tipo} onChange={(e) => setTipo(e.target.value)}
            >
              <MenuItem value="ILUSTRACION">Ilustración</MenuItem>
              <MenuItem value="MODELO_3D">Modelo 3D</MenuItem>
              <MenuItem value="PAQUETE">Paquete de Assets</MenuItem>
              <MenuItem value="SERVICIO">Servicio Técnico</MenuItem>
            </TextField>
          </Box>

          <TextField
            fullWidth label="Descripción detallada" multiline rows={4} margin="normal"
            value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
          />

          {/* Botón de subida estilizado */}
          <Button
            variant="outlined" component="label" fullWidth
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2, mb: 2, height: 50, borderStyle: 'dashed' }}
          >
            {archivo ? archivo.name : "Subir Imagen de Portada"}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>

          <Button
            type="submit" variant="contained" color="primary" fullWidth size="large"
            disabled={cargando}
            sx={{ mt: 2, fontWeight: 'bold' }}
          >
            {cargando ? "Publicando..." : "Publicar Ahora"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CrearProducto;