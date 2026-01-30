import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, Button } from '@mui/material';
import api from '../services/api'; // Importamos la configuración de Axios
import { obtenerProductos } from '../services/productoService';
import Navbar from '../components/Navbar';

const Home = () => {
  const [productos, setProductos] = useState([]);

  // Carga los productos al entrar a la página
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerProductos();
        setProductos(data);
      } catch (error) {
        console.error("Error al obtener productos");
      }
    };
    cargar();
  }, []);

  // Función para eliminar el producto
  const handleEliminar = async (id) => {
    // Confirmación nativa del navegador para evitar borrados accidentales
    if (window.confirm("¿Estás seguro? Se borrará la imagen de Amazon S3 y el registro de la base de datos.")) {
      try {
        // Enviamos la petición DELETE al backend
        await api.delete(`/productos/${id}`);
        
        // Actualizamos el estado local para que el producto desaparezca de la vista sin recargar
        setProductos(productos.filter(p => p.id !== id));
        
        alert("Producto eliminado con éxito.");
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar el producto. Revisa el backend.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Explorar Servicios
        </Typography>

        <Grid container spacing={3}>
          {productos.map((p) => (
            <Grid item key={p.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={p.urlArchivo || 'https://via.placeholder.com/300'}
                  alt={p.titulo}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold">{p.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.descripcion}</Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">${p.precio}</Typography>
                    {/* Botón de eliminar con color de advertencia */}
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small"
                      onClick={() => handleEliminar(p.id)}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Home;