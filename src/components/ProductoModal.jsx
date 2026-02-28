import React from 'react';
import {
  Dialog, DialogContent, DialogActions, Button, Typography, Box,
  Avatar, Chip, Divider, IconButton, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';

const ProductoModal = ({ open, onClose, producto }) => {
  const navigate = useNavigate();

  if (!producto) return null;

  const handleComprar = () => {
    onClose();
    navigate('/detalle-compra', { state: { producto } });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }
      }}
    >
      {/* Imagen del producto */}
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={producto.urlArchivo || producto.urlPortada || 'https://via.placeholder.com/600x300?text=Sin+Imagen'}
          alt={producto.titulo}
          sx={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
        />
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute', top: 10, right: 10,
            bgcolor: 'rgba(0,0,0,0.5)', color: 'white',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Vendedor */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            src={producto.vendedor?.fotoUrl}
            sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 'bold' }}
          >
            {producto.vendedor?.nombreMostrado?.charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {producto.vendedor?.nombreMostrado || 'Vendedor'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ fontSize: 14, color: '#FFB400' }} />
              <Typography variant="caption" color="text.secondary">
                Vendedor verificado
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Título */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.3 }}>
          {producto.titulo}
        </Typography>

        {/* Tipo y precio */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip
            label={producto.tipo?.replace('_', ' ')}
            color="primary"
            size="small"
            variant="outlined"
          />
          <Typography variant="h5" color="success.main" fontWeight="bold">
            ${producto.precio}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Descripción */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Descripción
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {producto.descripcion || 'Este vendedor no ha añadido una descripción detallada.'}
        </Typography>

        {/* Info adicional si existe */}
        {producto.categoria && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Categoría: <strong>{producto.categoria}</strong>
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, flex: 1 }}>
          Cerrar
        </Button>
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={handleComprar}
          sx={{ borderRadius: 2, flex: 2, py: 1.2 }}
        >
          Comprar ahora
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductoModal;
