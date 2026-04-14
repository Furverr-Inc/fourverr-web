import React, { useEffect, useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, List, ListItem,
  Avatar, Divider, Button, CircularProgress, Tooltip, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';

const WishlistDrawer = ({ open, onClose }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useThemeMode();
  const navigate = useNavigate();

  const cargar = async () => {
    if (!localStorage.getItem('token')) return;
    setLoading(true);
    try {
      const res = await api.get('/favoritos');
      setWishlist(res.data);
    } catch (err) {
      console.error('Error cargando wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) cargar();
  }, [open]);

  const handleQuitar = async (e, productoId) => {
    e.stopPropagation();
    try {
      await api.delete(`/favoritos/${productoId}`);
      setWishlist(prev => prev.filter(p => p.id !== productoId));
      window.dispatchEvent(new Event('zento-favoritos-cambiados'));
    } catch (err) {
      alert('Error al quitar de la wishlist');
    }
  };

  const handleComprar = (prod) => {
    onClose();
    navigate('/detalle-compra', { state: { producto: prod } });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 360,
          bgcolor: 'background.paper',
          borderLeft: '1px solid',
          borderColor: 'divider',
        }
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarBorderIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography variant="h6" fontWeight="bold">Mi Wishlist</Typography>
          {wishlist.length > 0 && (
            <Chip label={wishlist.length} size="small" color="primary" sx={{ height: 20, fontSize: 11 }} />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Contenido */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : wishlist.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8, px: 3 }}>
            <StarBorderIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" fontWeight="bold" color="text.secondary">
              Tu wishlist está vacía
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Usa el icono de estrella en cada servicio para guardarlo aquí
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {wishlist.map((prod, index) => (
              <React.Fragment key={prod.id}>
                <ListItem
                  sx={{ px: 2.5, py: 1.5, alignItems: 'flex-start', gap: 1.5 }}
                  disablePadding
                >
                  {/* Imagen */}
                  <Avatar
                    src={prod.urlArchivo || prod.urlPortada}
                    variant="rounded"
                    sx={{ width: 56, height: 56, borderRadius: 2, flexShrink: 0, bgcolor: 'primary.main' }}
                  >
                    {prod.titulo?.charAt(0)}
                  </Avatar>

                  {/* Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {prod.titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {prod.vendedor?.nombreMostrado || 'Vendedor'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                        ${prod.precio}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ShoppingCartIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleComprar(prod)}
                        sx={{ py: 0.3, px: 1, fontSize: 11, minWidth: 0 }}
                      >
                        Comprar
                      </Button>
                    </Box>
                  </Box>

                  {/* Quitar */}
                  <Tooltip title="Quitar de wishlist">
                    <IconButton
                      size="small"
                      onClick={(e) => handleQuitar(e, prod.id)}
                      sx={{ color: 'text.disabled', flexShrink: 0, '&:hover': { color: 'error.main' } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItem>
                {index < wishlist.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default WishlistDrawer;
