import React, { useEffect, useState } from 'react';
import { 
  Container, Grid, Card, CardMedia, CardContent, Typography, 
  CardActions, Button, Chip, Box, CircularProgress, Alert, Avatar
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
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary" sx={{ mb: 4 }}>
        Explora Servicios Digitales
      </Typography>
      
      <Grid container spacing={3}>
        {productos.map((prod) => (
          <Grid item key={prod.id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              borderRadius: 3, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              
              {/* LAZY LOADING Y CABLEADO DE S3 */}
              <CardMedia
                component="img"
                height="180"
                // Intentamos urlArchivo primero, luego urlPortada
                image={prod.urlArchivo || prod.urlPortada || "https://via.placeholder.com/300?text=Sin+Imagen"}
                alt={prod.titulo}
                loading="lazy" // 🚀 Lazy Loading activado
                sx={{ objectFit: 'cover' }}
              />

              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* Info del Vendedor Estilo Landing */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar 
                    sx={{ width: 24, height: 24, fontSize: '0.8rem', bgcolor: 'primary.main' }}
                    src={prod.vendedor?.fotoUrl} // Por si el vendedor tiene foto en S3
                  >
                    {prod.vendedor?.nombreMostrado?.charAt(0) || '?'}
                  </Avatar>
                  <Typography variant="caption" fontWeight="bold">
                    {prod.vendedor?.nombreMostrado || 'Vendedor'}
                  </Typography>
                </Box>

                <Typography gutterBottom variant="subtitle1" component="h2" fontWeight="bold" sx={{ lineHeight: 1.2, height: '2.4em', overflow: 'hidden' }}>
                  {prod.titulo}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip 
                    label={prod.tipo?.replace('_', ' ')} // Para que SERVICIO_GIG se vea como SERVICIO GIG
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    ${prod.precio}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                <Button 
                  variant="contained" 
                  startIcon={<ShoppingCartIcon />} 
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  Comprar
                </Button>

                {prod.vendedor && String(prod.vendedor.id) === usuarioLogueado && (
                  <Button 
                    size="small" 
                    color="error" 
                    variant="tonal" 
                    onClick={() => handleEliminar(prod.id)}
                    sx={{ minWidth: '45px', borderRadius: 2 }}
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