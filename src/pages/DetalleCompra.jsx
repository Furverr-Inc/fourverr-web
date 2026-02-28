import React, { useState } from 'react';
import {
  Container, Box, Typography, Card, CardMedia, Avatar,
  Button, Divider, Chip, Alert, CircularProgress, Paper, Stack, TextField
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const DetalleCompra = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const producto = location.state?.producto;

  const [comprando, setComprando] = useState(false);
  const [compraExitosa, setCompraExitosa] = useState(false);
  const [error, setError] = useState(null);
  const [descripcionCompra, setDescripcionCompra] = useState('');

  if (!producto) {
    return (
      <Container sx={{ mt: 6, textAlign: 'center' }}>
        <Alert severity="warning">No se encontró información del producto.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/home')}>Volver al inicio</Button>
      </Container>
    );
  }

  const handleConfirmarCompra = async () => {
    setComprando(true);
    setError(null);
    try {
      // Ajusta el endpoint a tu API real
      await api.post('/compras', {
        productoId: producto.id,
        compradorId: localStorage.getItem('usuarioId'),
        descripcion: descripcionCompra,
      });
      setCompraExitosa(true);
    } catch (err) {
      console.error(err);
      setError('Hubo un error al procesar tu compra. Intenta de nuevo.');
    } finally {
      setComprando(false);
    }
  };

  if (compraExitosa) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ¡Compra realizada con éxito!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Tu compra de <strong>{producto.titulo}</strong> fue procesada correctamente.
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'left', mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>RESUMEN</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>{producto.titulo}</Typography>
            <Typography fontWeight="bold">${producto.precio}</Typography>
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography fontWeight="bold">Total</Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">${producto.precio}</Typography>
          </Box>
        </Paper>
        <Button variant="contained" onClick={() => navigate('/home')} sx={{ borderRadius: 2 }}>
          Seguir explorando
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 5, mb: 5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: 'text.secondary' }}
        >
          Volver
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ ml: 'auto', mr: 'auto' }}>
          Detalle de Compra
        </Typography>
      </Box>

      {/* Card del producto */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', mb: 3 }}>
        <CardMedia
          component="img"
          height="200"
          image={producto.urlArchivo || producto.urlPortada || 'https://via.placeholder.com/600x200?text=Sin+Imagen'}
          alt={producto.titulo}
          sx={{ objectFit: 'cover' }}
        />
        <Box sx={{ p: 2.5 }}>
          {/* Vendedor */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar src={producto.vendedor?.fotoUrl} sx={{ bgcolor: 'primary.main' }}>
              {producto.vendedor?.nombreMostrado?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">Vendedor</Typography>
              <Typography variant="body2" fontWeight="bold">
                {producto.vendedor?.nombreMostrado || 'Vendedor'}
              </Typography>
            </Box>
            <Chip
              label={producto.tipo?.replace('_', ' ')}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          </Box>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {producto.titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {producto.descripcion || 'Sin descripción disponible.'}
          </Typography>
        </Box>
      </Card>

      {/* Resumen del pedido */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ReceiptLongIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">Resumen del pedido</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Producto</Typography>
            <Typography variant="body2">{producto.titulo}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Tipo</Typography>
            <Typography variant="body2">{producto.tipo?.replace('_', ' ')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Vendedor</Typography>
            <Typography variant="body2">{producto.vendedor?.nombreMostrado || 'N/A'}</Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">Total a pagar</Typography>
          <Typography variant="h5" fontWeight="bold" color="success.main">
            ${producto.precio}
          </Typography>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Campo de descripción */}
      <TextField
        label="Descripción o notas para el vendedor"
        placeholder="Ej: Necesito entrega urgente, tengo una duda sobre el servicio..."
        multiline
        rows={3}
        fullWidth
        value={descripcionCompra}
        onChange={(e) => setDescripcionCompra(e.target.value)}
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />

      {/* Botón confirmar */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={comprando ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
        onClick={handleConfirmarCompra}
        disabled={comprando}
        sx={{ borderRadius: 3, py: 1.5, fontSize: '1rem' }}
      >
        {comprando ? 'Procesando...' : 'Confirmar compra'}
      </Button>
    </Container>
  );
};

export default DetalleCompra;