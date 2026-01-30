import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  // Función para limpiar la sesión y volver al login
  const handleLogout = () => {
    // Por ahora solo redirigimos, luego limpiaremos estados globales
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Container>
        <Toolbar disableGutters>
          {/* Logo o Nombre de la marca */}
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate('/home')}
          >
            FOURVERR
          </Typography>

          {/* Botones de navegación */}
          <Box>
            <Button color="inherit" onClick={() => navigate('/home')}>
              Inicio
            </Button>
            <Button 
              color="inherit" 
              variant="outlined" 
              sx={{ ml: 2, borderColor: 'white' }} 
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;