import { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Card, CardMedia, Avatar,
  Button, Divider, Chip, Alert, CircularProgress, Paper, Stack, TextField
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { crearPaymentIntent } from '../services/stripeService';
import api from '../services/api';

// Tu clave PÚBLICA de Stripe (pk_test_...) — esta SÍ puede estar en el frontend
const stripePromise = loadStripe('pk_test_51T74jUFKdsvSDP2eCfedpnfox6VK154SypCZ55s91DyZPRQub1WeqiMdQGdfJtOXzGLFLBMm40irtD64CT0eh8pm001KR62q6k');

const DetalleCompra = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const producto = location.state?.producto;

  const [clientSecret, setClientSecret] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [compraExitosa, setCompraExitosa] = useState(false);
  const [error, setError] = useState(null);
  const [descripcionCompra, setDescripcionCompra] = useState('');

  useEffect(() => {
    if (!producto) return;

    // En cuanto abre la pantalla, ya creamos el PaymentIntent en Stripe
    // Así el formulario está listo antes de que el usuario haga clic en pagar
    crearPaymentIntent(producto.id, 'mxn')
      .then(data => setClientSecret(data.clientSecret))
      .catch(() => setError('No se pudo iniciar el proceso de pago. Intenta de nuevo.'))
      .finally(() => setCargando(false));
  }, [producto]);

  const handlePagoExitoso = async (paymentIntent) => {
    try {
      // El pago en Stripe ya ocurrió — ahora registramos el pedido en nuestra BD
      await api.post('/pedidos', {
        idProducto: producto.id,
        requisitos: descripcionCompra,
        stripePaymentIntentId: paymentIntent.id, // guardamos la referencia
      });
      setCompraExitosa(true);
    } catch {
      setError('El pago se procesó pero hubo un error al registrar tu pedido. Contacta soporte.');
    }
  };

  // Producto no encontrado
  if (!producto) {
    return (
      <Container sx={{ mt: 6, textAlign: 'center' }}>
        <Alert severity="warning">No se encontró información del producto.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/home')}>Volver al inicio</Button>
      </Container>
    );
  }

  // Pantalla de éxito
  if (compraExitosa) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ¡Pago realizado con éxito!
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
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
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
          image={producto.urlPortada || producto.urlArchivo || 'https://via.placeholder.com/600x200?text=Sin+Imagen'}
          alt={producto.titulo}
          sx={{ objectFit: 'cover' }}
        />
        <Box sx={{ p: 2.5 }}>
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
            <Chip label={producto.tipo?.replace('_', ' ')} size="small" color="primary" variant="outlined" sx={{ ml: 'auto' }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>{producto.titulo}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {producto.descripcion || 'Sin descripción disponible.'}
          </Typography>
        </Box>
      </Card>

      {/* Resumen */}
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
            <Typography variant="body2" color="text.secondary">Vendedor</Typography>
            <Typography variant="body2">{producto.vendedor?.nombreMostrado || 'N/A'}</Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">Total a pagar</Typography>
          <Typography variant="h5" fontWeight="bold" color="success.main">${producto.precio} MXN</Typography>
        </Box>
      </Paper>

      {/* Notas para el vendedor */}
      <TextField
        label="Notas para el vendedor (opcional)"
        placeholder="Ej: Necesito entrega urgente..."
        multiline
        rows={3}
        fullWidth
        value={descripcionCompra}
        onChange={(e) => setDescripcionCompra(e.target.value)}
        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Formulario de pago de Stripe */}
      {cargando ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : clientSecret ? (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            🔒 Pago seguro procesado por Stripe
          </Typography>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onExito={handlePagoExitoso} producto={producto} />
          </Elements>
        </Paper>
      ) : (
        <Alert severity="error">No se pudo cargar el formulario de pago.</Alert>
      )}
    </Container>
  );
};

export default DetalleCompra;