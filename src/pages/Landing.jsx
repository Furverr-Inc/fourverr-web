import React, { useEffect, useState } from 'react';
import { 
  Container, Grid, Card, CardMedia, CardContent, Typography, 
  Box, Chip, CircularProgress, Alert, AppBar, Toolbar, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Landing = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const cargarProductos = async () => {
    try {
      const response = await api.get('/productos');
      setProductos(response.data);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError("No se pudieron cargar los servicios.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductoClick = () => {
    // Redirigir al login si no está autenticado
    navigate('/login');
  };

  const handleAcceder = () => {
    navigate('/login');
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Navbar público */}
      <AppBar position="static" sx={{ background: 'white', boxShadow: 1 }}>
        <Toolbar>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ flexGrow: 1, fontWeight: 'bold', color: '#1dbf73' }}
          >
            FOURVERR
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={handleAcceder}
            sx={{ 
              backgroundColor: '#1dbf73',
              '&:hover': { backgroundColor: '#19a463' },
              fontWeight: 'bold',
              px: 3
            }}
          >
            Acceder
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1a472a 0%, #2d5f3f 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            Encuentra el servicio <span style={{ color: '#1dbf73', fontStyle: 'italic' }}>freelance</span>
          </Typography>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
          >
            adecuado de inmediato
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                backgroundColor: '#1dbf73',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                💬
              </Box>
              <Typography variant="body1">Soporte 24 horas</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                backgroundColor: '#1dbf73',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🔒
              </Box>
              <Typography variant="body1">Pago seguro</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Categorías */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 4 }}>
        <Grid container spacing={2} justifyContent="center">
          {['Programación', 'Diseño Gráfico', 'Marketing', 'Escritura', 'Video', 'Música'].map((cat) => (
            <Grid item key={cat}>
              <Chip 
                label={cat} 
                sx={{ 
                  py: 2.5, 
                  px: 2,
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': { 
                    backgroundColor: '#1dbf73',
                    color: 'white'
                  }
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Servicios Populares */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          fontWeight="bold"
          sx={{ mb: 4 }}
        >
          Servicios populares
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Grid container spacing={4}>
          {productos.map((prod) => (
            <Grid item key={prod.id} xs={12} sm={6} md={4} lg={3}>
              <Card 
                onClick={handleProductoClick}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={prod.urlPortada || "https://via.placeholder.com/300?text=Sin+Imagen"}
                  alt={prod.titulo}
                />

                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  {/* Vendedor */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Box 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        backgroundColor: '#1dbf73',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {prod.vendedor?.nombreMostrado?.charAt(0) || '?'}
                    </Box>
                    <Typography variant="body2" fontWeight="500">
                      {prod.vendedor?.nombreMostrado || 'Vendedor'}
                    </Typography>
                  </Box>

                  {/* Título */}
                  <Typography 
                    variant="body1" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '48px'
                    }}
                  >
                    {prod.titulo}
                  </Typography>

                  {/* Rating simulado */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Typography variant="body2" color="orange" sx={{ fontWeight: 'bold' }}>
                      ⭐ 4.9
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      (156)
                    </Typography>
                  </Box>
                </CardContent>

                {/* Precio */}
                <Box sx={{ 
                  borderTop: '1px solid #e0e0e0', 
                  p: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    Desde
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ${prod.precio}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {productos.length === 0 && !error && (
          <Alert severity="info" sx={{ mt: 3 }}>
            No hay servicios disponibles en este momento
          </Alert>
        )}
      </Container>

      {/* Footer Call to Action */}
      <Box 
        sx={{ 
          background: '#f5f5f5',
          py: 6,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" gutterBottom fontWeight="bold">
            ¿Listo para comenzar?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Únete a miles de freelancers y clientes
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleAcceder}
            sx={{ 
              backgroundColor: '#1dbf73',
              '&:hover': { backgroundColor: '#19a463' },
              fontWeight: 'bold',
              px: 5,
              py: 1.5
            }}
          >
            Comenzar Ahora
          </Button>
        </Container>
      </Box>
    </>
  );
};

export default Landing;
