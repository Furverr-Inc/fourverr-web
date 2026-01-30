import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  // Obtenemos el nombre guardado en el Login. Si no hay, ponemos 'Invitado'
  const nombreUsuario = localStorage.getItem('usuarioNombre') || 'Invitado';

  // Función para cerrar sesión
  const handleLogout = () => {
    // Limpiamos los datos del navegador
    localStorage.clear();
    // Redirigimos al Login
    navigate('/login');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#2c3e50' }}>
      <Container>
        <Toolbar disableGutters>
          {/* Nombre de la App/Logo */}
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer', letterSpacing: 1 }}
            onClick={() => navigate('/home')}
          >
            FOURVERR
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Saludo personalizado */}
            <Typography variant="body1" sx={{ mr: 3, fontStyle: 'italic' }}>
              Hola, {nombreUsuario}
            </Typography>

            <Button color="inherit" onClick={() => navigate('/home')}>
              Inicio
            </Button>
            
            {/* Botón para ir a crear un producto nuevo */}
            <Button color="inherit" onClick={() => navigate('/nuevo')}>
              Vender
            </Button>

            <Button 
              variant="contained" 
              color="error" 
              size="small"
              sx={{ ml: 2, fontWeight: 'bold' }}
              onClick={handleLogout}
            >
              Salir
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;