import React, { useEffect, useState } from 'react';
import { 
  Container, Grid, Card, CardMedia, CardContent, Typography, 
  CardActions, Button, Chip, Box, CircularProgress, Alert 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import api from '../services/api'; 

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usuarioLogueado = localStorage.getItem('usuarioId'); 

  const cargarProductos = async () => {
    try {
      const response = await api.get('/productos');
      setProductos(response.data);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;

    try {
      await api.delete(`/productos/${id}`);
      setProductos(productos.filter(p => p.id !== id));
      alert("Producto eliminado correctamente");
    } catch (err) {
      alert("Error al eliminar. Tal vez no tienes permiso.");
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
        Explora Servicios Digitales
      </Typography>
      
      <Grid container spacing={4}>
        {productos.map((prod) => (
          <Grid item key={prod.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 3 }}>
              
              <CardMedia
                component="img"
                height="200"
                image={prod.urlPortada || "https://via.placeholder.com/300?text=Sin+Imagen"}
                alt={prod.titulo}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip label={prod.tipo} color={prod.tipo === 'SERVICIO' ? 'secondary' : 'info'} size="small" />
                  <Typography variant="h6" color="green" fontWeight="bold">
                    ${prod.precio}
                  </Typography>
                </Box>

                <Typography gutterBottom variant="h5" component="h2" fontWeight="medium">
                  {prod.titulo}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {prod.descripcion.substring(0, 100)}...
                </Typography>

                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'gray' }}>
                  Vendedor: <strong>{prod.vendedor ? prod.vendedor.nombreMostrado : 'Desconocido'}</strong>
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button variant="contained" startIcon={<ShoppingCartIcon />} fullWidth>
                  Comprar
                </Button>

                {/* BOTÓN ELIMINAR PROTEGIDO POR AUTORÍA */}
                {prod.vendedor && prod.vendedor.nombreUsuario === usuarioLogueado && (
                  <Button 
                    size="small" 
                    color="error" 
                    variant="outlined" 
                    onClick={() => handleEliminar(prod.id)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;