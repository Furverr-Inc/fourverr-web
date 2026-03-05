import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Tooltip, Badge } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import WishlistDrawer from './WishlistDrawer';

const Navbar = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeMode();
  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Usuario';
  const usuarioRol = localStorage.getItem('usuarioRol');
  const [fotoUrl, setFotoUrl] = useState(localStorage.getItem('usuarioFoto') || '');
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const handleSolicitar = async () => {
    if (!window.confirm("¿Deseas enviar tu solicitud para ser vendedor?")) return;
    try {
      await api.post('/users/solicitar-vendedor');
      alert("✅ Solicitud enviada. Un administrador revisará tu perfil.");
    } catch (err) {
      alert("Error al enviar solicitud o ya la enviaste.");
    }
  };

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
      } catch (err) {}
    }
    try {
      const res = await api.get('/users/perfil');
      const nuevaFoto = res.data.fotoUrl || '';
      const nuevoNombre = res.data.nombreMostrado || res.data.username || usuarioNombre;
      if (nuevaFoto !== fotoUrl) {
        setFotoUrl(nuevaFoto);
        localStorage.setItem('usuarioFoto', nuevaFoto);
      }
      localStorage.setItem('usuarioNombre', nuevoNombre);
    } catch (err) {}

    // Cargar conteo de wishlist
    try {
      const res = await api.get('/favoritos');
      setWishlistCount(res.data.length);
    } catch (err) {}
  };

  useEffect(() => { checkStatus(); }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/home"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              textDecoration: 'none',
              color: isDark ? 'primary.light' : 'primary.main',
            }}
          >
            FOURVERR
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

            {/* TOGGLE TEMA */}
            <Tooltip title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
              <IconButton onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* WISHLIST - abre drawer */}
            <Tooltip title="Mi Wishlist">
              <IconButton onClick={() => setWishlistOpen(true)} sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={wishlistCount} color="primary" max={99}>
                  <StarIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Hola, {usuarioNombre}
            </Typography>

            {/* FOTO DE PERFIL */}
            <IconButton component={Link} to="/perfil" sx={{ p: 0.5 }}>
              {fotoUrl ? (
                <Avatar src={fotoUrl} alt={usuarioNombre} sx={{ width: 36, height: 36 }} />
              ) : (
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                  {usuarioNombre.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </IconButton>

            {/* ROLES */}
            {usuarioRol === 'SELLER' || usuarioRol === 'ADMIN' ? (
              <Button variant="contained" color="primary" component={Link} to="/nuevo" startIcon={<StorefrontIcon />} sx={{ fontWeight: 'bold', color: 'white' }}>
                Publicar Gig
              </Button>
            ) : (
              <Button variant="outlined" color="primary" onClick={handleSolicitar}>
                Convertirse en Vendedor
              </Button>
            )}

            <Button color="secondary" onClick={handleLogout}>
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* DRAWER WISHLIST */}
      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
      />
    </>
  );
};

export default Navbar;
