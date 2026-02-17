import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Usuario';
  const usuarioRol = localStorage.getItem('usuarioRol'); // 'USER', 'SELLER', 'ADMIN'

  // Función para pedir ser vendedor
  const handleSolicitar = async () => {
    if(!window.confirm("¿Deseas enviar tu solicitud para ser vendedor?")) return;
    try {
      await api.post('/users/solicitar-vendedor');
      alert("✅ Solicitud enviada. Un administrador revisará tu perfil.");
    } catch (err) {
      console.error(err);
      alert("Error al enviar solicitud o ya la enviaste.");
    }
  };

  // Función mágica: Revisa si ya me aprobaron sin cerrar sesión
  const checkStatus = async () => {
    if (usuarioRol === 'USER') {
      try {
        const response = await api.get('/users/refresh-status');
        const { token, role } = response.data;

        if (role === 'SELLER') {
          // Actualizamos localStorage silenciosamente
          localStorage.setItem('token', token);
          localStorage.setItem('usuarioRol', role);
          
          alert("¡Felicidades! Has sido aprobado como Vendedor.");
          window.location.reload(); // Recargamos para ver los nuevos botones
        }
      } catch (err) {
        console.log("Verificación de estado fallida (normal si no hay red)");
      }
    }
  };

  useEffect(() => {
    checkStatus();
    // Podrías poner un setInterval aquí si quieres que revise cada 30 seg
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <AppBar position="sticky" color="inherit" elevation={1}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/home" 
          sx={{ flexGrow: 1, fontWeight: 'bold', color: '#1dbf73', textDecoration: 'none' }}
        >
          FOURVERR
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#555' }}>
            Hola, {usuarioNombre}
          </Typography>

          {/* BOTÓN DE PERFIL */}
          <IconButton 
            component={Link} 
            to="/perfil"
            sx={{ 
              color: '#1dbf73',
              '&:hover': { backgroundColor: 'rgba(29, 191, 115, 0.1)' }
            }}
          >
            <AccountCircleIcon />
          </IconButton>

          {/* LÓGICA DE ROLES */}
          {usuarioRol === 'SELLER' || usuarioRol === 'ADMIN' ? (
            <Button 
              variant="contained" 
              color="primary" // Usa el verde del tema
              component={Link} 
              to="/nuevo"
              startIcon={<StorefrontIcon />}
              sx={{ fontWeight: 'bold', color: 'white' }}
            >
              Publicar Gig
            </Button>
          ) : (
            <Button 
              variant="outlined" 
              color="primary"
              onClick={handleSolicitar}
            >
              Convertirse en Vendedor
            </Button>
          )}

          <Button color="secondary" onClick={handleLogout}>
            Salir
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;