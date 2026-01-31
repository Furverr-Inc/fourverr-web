import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 

// NOTA: YA NO IMPORTAMOS NAVBAR AQUÍ PORQUE EL "PROTECTED ROUTE" LA PONE SOLA

const CrearProducto = () => {
  const navigate = useNavigate();
  
  // Estados para el formulario
  const [titulo, setTitulo] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState(null);
  
  // Estados de carga y error
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Manejo de la selección de archivo
  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  // Enviar formulario al Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!titulo || !precio || !archivo) {
      setError(true);
      setMensaje("Por favor completa título, precio y sube una imagen.");
      return;
    }

    setCargando(true);
    
    // Usamos FormData para enviar texto + archivo
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('precio', precio);
    formData.append('descripcion', descripcion);
    formData.append('file', archivo); // 'file' debe coincidir con el @RequestParam del backend
    
    // Obtenemos el ID del usuario del localStorage (para saber quién vende)
    const usuarioId = localStorage.getItem('usuarioId'); 
    formData.append('usuarioId', usuarioId); // Opcional, si tu backend lo pide así

    try {
      // El token se envía solo gracias a api.js
      await api.post('/productos/crear', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("Producto creado exitosamente");
      navigate('/home'); // Regresamos al inicio

    } catch (err) {
      console.error(err);
      setError(true);
      setMensaje("Error al subir el producto. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Nuevo Producto (Amazon S3)
        </Typography>

        {mensaje && <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }}>{mensaje}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Título del producto"
            margin="normal"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          
          <TextField
            fullWidth
            label="Precio"
            type="number"
            margin="normal"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />

          <TextField
            fullWidth
            label="Descripción"
            multiline
            rows={3}
            margin="normal"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          {/* Input para archivos */}
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          >
            {archivo ? archivo.name : "Seleccionar Imagen"}
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept="image/*"
            />
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={cargando}
          >
            {cargando ? "Subiendo..." : "Publicar Producto"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CrearProducto;