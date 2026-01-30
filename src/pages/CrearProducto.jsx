import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Box } from '@mui/material';
import api from '../services/api';
import Navbar from '../components/Navbar';

const CrearProducto = () => {
  const [titulo, setTitulo] = useState('');
  const [precio, setPrecio] = useState('');
  const [archivo, setArchivo] = useState(null); // Aquí guardamos el archivo binario

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // FormData es necesario para enviar archivos al backend
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('precio', precio);
    formData.append('file', archivo); // El nombre 'file' debe ser igual en Java (@RequestParam)

    try {
      await api.post('/productos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' } // Importante para archivos
      });
      alert("¡Producto subido a S3 y guardado en DB!");
    } catch (error) {
      console.error("Error al subir", error);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 5 }}>
          <Typography variant="h5" gutterBottom>Nuevo Producto (Amazon S3)</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Título del producto" margin="normal" required
              onChange={(e) => setTitulo(e.target.value)} />
            <TextField fullWidth label="Precio" type="number" margin="normal" required
              onChange={(e) => setPrecio(e.target.value)} />
            
            {/* Input especial para archivos */}
            <input type="file" style={{ marginTop: '20px' }} 
              onChange={(e) => setArchivo(e.target.files[0])} required />
            
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 4 }}>
              Publicar Producto
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default CrearProducto;