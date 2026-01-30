import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, Button } from '@mui/material';
import { obtenerProductos } from '../services/productoService';
import Navbar from '../components/Navbar'; // Importamos la barra de navegación

const Home = () => {
  // Estado para guardar los productos que vienen de la base de datos
  const [productos, setProductos] = useState([]);

  // useEffect carga los datos en cuanto entramos a la página
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await obtenerProductos();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar productos");
      }
    };
    cargarProductos();
  }, []);

  // El return debe estar SIEMPRE dentro de la función del componente...
  return (
    <>
      {/* Componente de la barra superior */}
      <Navbar /> 

      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 5 }}>
          Marketplace Fourverr
        </Typography>

        {/* Rejilla de productos */}
        <Grid container spacing={4}>
          {productos.map((p) => (
            <Grid item key={p.id} xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={p.urlArchivo || 'https://via.placeholder.com/300'}
                  alt={p.titulo}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold">{p.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {p.descripcion}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">${p.precio}</Typography>
                    <Typography variant="caption" sx={{ bgcolor: '#e3f2fd', p: 0.5, borderRadius: 1, fontWeight: 'bold' }}>
                      {p.tipo}
                    </Typography>
                  </Box>
                  
                  <Button fullWidth variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                    Ver detalles
                  </Button>
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