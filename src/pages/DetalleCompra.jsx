import { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Card, CardMedia, Avatar,
  Button, Divider, Chip, Alert, CircularProgress,
  Paper, Stack, TextField, IconButton
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon   from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddIcon    from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { crearPaymentIntent } from '../services/stripeService';
import api from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const DetalleCompra = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const producto  = location.state?.producto;

  const [cantidad,          setCantidad]         = useState(1);
  const [clientSecret,      setClientSecret]      = useState(null);
  const [cargando,          setCargando]          = useState(false);
  const [compraExitosa,     setCompraExitosa]     = useState(false);
  const [error,             setError]             = useState(null);
  const [descripcionCompra, setDescripcionCompra] = useState('');

  const precioUnitario = producto ? parseFloat(producto.precio) : 0;
  const precioTotal    = (precioUnitario * cantidad).toFixed(2);

  // Cuando cambia cantidad, resetear el payment intent
  const handleCantidad = (delta) => {
    setCantidad(prev => Math.max(1, prev + delta));
    setClientSecret(null);
  };

  const handleIniciarPago = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await crearPaymentIntent(producto.id, 'mxn', cantidad);
      setClientSecret(data.clientSecret);
    } catch {
      setError('No se pudo iniciar el proceso de pago. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const handlePagoExitoso = async (paymentIntent) => {
    try {
      await api.post('/pedidos', {
        idProducto: producto.id,
        requisitos: descripcionCompra,
        stripePaymentIntentId: paymentIntent.id,
        cantidad,
      });
      const pedidoRes = await api.get("/pedidos/mis-compras");
      const ultimoPedido = pedidoRes.data?.[0] || null;
      navigate("/compra-exitosa", { state: { pedido: ultimoPedido } });
    } catch {
      setError('Pago procesado pero error al registrar el pedido. Contacta soporte.');
    }
  };

  if (!producto) return (
    <Container sx={{ mt:6, textAlign:'center' }}>
      <Alert severity="warning">No se encontró información del producto.</Alert>
      <Button sx={{ mt:2 }} onClick={() => navigate('/home')}>Volver al inicio</Button>
    </Container>
  );

  if (compraExitosa) return (
    <Container maxWidth="sm" sx={{ mt:8, textAlign:'center' }}>
      <CheckCircleOutlineIcon sx={{ fontSize:80, color:'success.main', mb:2 }} />
      <Typography variant="h4" fontWeight="bold" gutterBottom>¡Pago realizado con éxito!</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb:3 }}>
        Compraste <strong>{producto.titulo}</strong> × {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}.
      </Typography>
      <Paper sx={{ p:3, borderRadius:3, textAlign:'left', mb:3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>RESUMEN</Typography>
        <Divider sx={{ mb:2 }} />
        <Box sx={{ display:'flex', justifyContent:'space-between' }}>
          <Typography>{producto.titulo} × {cantidad}</Typography>
          <Typography fontWeight="bold">${precioTotal} MXN</Typography>
        </Box>
        <Divider sx={{ my:1.5 }} />
        <Box sx={{ display:'flex', justifyContent:'space-between' }}>
          <Typography fontWeight="bold">Total</Typography>
          <Typography variant="h6" fontWeight="bold" color="success.main">${precioTotal} MXN</Typography>
        </Box>
      </Paper>
      <Button variant="contained" onClick={() => navigate('/home')} sx={{ borderRadius:2 }}>
        Seguir explorando
      </Button>
    </Container>
  );

  return (
    <Container maxWidth="sm" sx={{ mt:5, mb:5 }}>
      {/* Header */}
      <Box sx={{ display:'flex', alignItems:'center', mb:3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color:'text.secondary' }}>
          Volver
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ mx:'auto' }}>Detalle de Compra</Typography>
      </Box>

      {/* Card producto */}
      <Card sx={{ borderRadius:3, boxShadow:'0 4px 20px rgba(0,0,0,0.1)', mb:3 }}>
        <CardMedia component="img" height={{ xs: 140, sm: 200 }}
          image={producto.urlPortada || producto.urlArchivo || 'https://via.placeholder.com/600x200'}
          alt={producto.titulo} sx={{ objectFit:'cover' }} />
        <Box sx={{ p:2.5 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2 }}>
            <Avatar src={producto.vendedor?.fotoUrl} sx={{ bgcolor:'primary.main' }}>
              {producto.vendedor?.nombreMostrado?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">Vendedor</Typography>
              <Typography variant="body2" fontWeight="bold">{producto.vendedor?.nombreMostrado || 'N/A'}</Typography>
            </Box>
            <Chip label={producto.tipo?.replace(/_/g,' ')} size="small" color="primary"
              variant="outlined" sx={{ ml:'auto' }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>{producto.titulo}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight:1.7 }}>
            {producto.descripcion || 'Sin descripción.'}
          </Typography>
        </Box>
      </Card>

      {/* Selector de cantidad */}
      <Paper sx={{ p:3, borderRadius:3, mb:3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Cantidad</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
          <IconButton onClick={() => handleCantidad(-1)} disabled={cantidad <= 1}
            sx={{ border:'1px solid', borderColor:'divider', borderRadius:2, minWidth: 44, minHeight: 44 }}>
            <RemoveIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" sx={{ minWidth:40, textAlign:'center' }}>
            {cantidad}
          </Typography>
          <IconButton onClick={() => handleCantidad(1)}
            sx={{ border:'1px solid', borderColor:'divider', borderRadius:2, minWidth: 44, minHeight: 44 }}>
            <AddIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ ml:1 }}>
            × ${producto.precio} c/u
          </Typography>
        </Box>
      </Paper>

      {/* Resumen */}
      <Paper sx={{ p:3, borderRadius:3, mb:3 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
          <ReceiptLongIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">Resumen del pedido</Typography>
        </Box>
        <Divider sx={{ mb:2 }} />
        <Stack spacing={1.5}>
          <Box sx={{ display:'flex', justifyContent:'space-between' }}>
            <Typography variant="body2" color="text.secondary">Producto</Typography>
            <Typography variant="body2">{producto.titulo}</Typography>
          </Box>
          <Box sx={{ display:'flex', justifyContent:'space-between' }}>
            <Typography variant="body2" color="text.secondary">Cantidad</Typography>
            <Typography variant="body2">{cantidad}</Typography>
          </Box>
          <Box sx={{ display:'flex', justifyContent:'space-between' }}>
            <Typography variant="body2" color="text.secondary">Precio unitario</Typography>
            <Typography variant="body2">${producto.precio} MXN</Typography>
          </Box>
        </Stack>
        <Divider sx={{ my:2 }} />
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">Total a pagar</Typography>
          <Typography variant="h5" fontWeight="bold" color="success.main">${precioTotal} MXN</Typography>
        </Box>
      </Paper>

      {/* Notas */}
      <TextField
        label="Notas para el vendedor (opcional)"
        placeholder="Ej: Necesito entrega urgente..."
        multiline rows={3} fullWidth
        value={descripcionCompra} onChange={e => setDescripcionCompra(e.target.value)}
        sx={{ mb:3, '& .MuiOutlinedInput-root': { borderRadius:3 } }}
      />

      {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

      {/* Botón iniciar pago */}
      {!clientSecret ? (
        <Button variant="contained" fullWidth size="large"
          onClick={handleIniciarPago} disabled={cargando}
          sx={{ py:1.5, borderRadius:3, fontWeight:'bold', fontSize:'1rem', minHeight: 44 }}>
          {cargando ? <CircularProgress size={24} color="inherit" /> : `Pagar $${precioTotal} MXN`}
        </Button>
      ) : (
        <Paper sx={{ p:3, borderRadius:3 }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <LockOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              Pago seguro procesado por Stripe
            </Typography>
          </Stack>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onExito={handlePagoExitoso} producto={producto} />
          </Elements>
        </Paper>
      )}
    </Container>
  );
};

export default DetalleCompra;
