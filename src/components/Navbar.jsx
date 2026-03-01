import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Tooltip } from '@mui/material'; // Añadido Tooltip
import { useNavigate, Link } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Añadido el icono de corazón
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Usuario';
  const usuarioRol = localStorage.getItem('usuarioRol'); // 'USER', 'SELLER', 'ADMIN'
  const [fotoUrl, setFotoUrl] = useState(localStorage.getItem('usuarioFoto') || '');

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
          localStorage.setItem('token', token);
          localStorage.setItem('usuarioRol', role);
          alert("¡Felicidades! Has sido aprobado como Vendedor.");
          window.location.reload();
        }
      } catch (err) {
        console.log("Verificación de estado fallida (normal si no hay red)");
      }
    }

    // Actualizar foto si cambió en BD
    try {
      const res = await api.get('/users/perfil');
      const nuevaFoto = res.data.fotoUrl || '';
      const nuevoNombre = res.data.nombreMostrado || res.data.username || usuarioNombre;
      if (nuevaFoto !== fotoUrl) {
        setFotoUrl(nuevaFoto);
        localStorage.setItem('usuarioFoto', nuevaFoto);
      }
      localStorage.setItem('usuarioNombre', nuevoNombre);
    } catch (err) {
      // silencioso
    }
  };

  useEffect(() => {
    checkStatus();
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
          
          {/* --- BOTÓN DE FAVORITOS (NUEVO) --- */}
          <Tooltip title="Mis Favoritos">
            <IconButton 
              component={Link} 
              to="/favoritos" 
              sx={{ color: '#74767e' }}
            >
              <FavoriteBorderIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="body2" sx={{ color: '#555' }}>
            Hola, {usuarioNombre}
          </Typography>

          {/* BOTÓN DE PERFIL CON FOTO */}
          <IconButton 
            component={Link} 
            to="/perfil"
            sx={{ p: 0.5 }}
          >
            {fotoUrl ? (
              <Avatar 
                src={fotoUrl} 
                alt={usuarioNombre}
                sx={{ width: 36, height: 36 }}
              />
            ) : (
              <Avatar sx={{ width: 36, height: 36, backgroundColor: '#1dbf73' }}>
                {usuarioNombre.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </IconButton>

          {/* LÓGICA DE ROLES */}
          {usuarioRol === 'SELLER' || usuarioRol === 'ADMIN' ? (
            <Button 
              variant="contained" 
              color="primary"
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