import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Usuario';

  const handleLogout = () => {
    // 1. DESTRUIR LA LLAVE (Importante para probar el guardia)
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioNombre');

    // 2. Redirigir al Login
    navigate('/');
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          FOURVERR
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#eee' }}>
            Hola, {usuarioNombre}
          </Typography>

          <Button color="inherit" component={Link} to="/home">
            Inicio
          </Button>
          
          <Button color="inherit" component={Link} to="/nuevo">
            Vender
          </Button>

          {/* Botón Rojo para Salir */}
          <Button 
            variant="contained" 
            color="error" 
            size="small"
            onClick={handleLogout}
          >
            Salir
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;