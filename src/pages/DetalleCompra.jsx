import { useState } from 'react';
import {
  Container, Box, Typography, Card, CardMedia, Avatar,
  Button, Divider, Chip, Alert, CircularProgress,
  Paper, Stack, TextField, IconButton, useTheme,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { crearPaymentIntent } from '../services/stripeService';
import api from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const ES_MEXICO = (pais) => {
  const p = (pais || '').trim().toLowerCase();
  return p === 'méxico' || p === 'mexico' || p === 'mx';
};

const soloDigitos = (s) => String(s || '').replace(/\D/g, '');

const DetalleCompra = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const producto = location.state?.producto;

  const [cantidad, setCantidad] = useState(1);
  const [clientSecret, setClientSecret] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [compraExitosa, setCompraExitosa] = useState(false);
  const [error, setError] = useState(null);
  const [descripcionCompra, setDescripcionCompra] = useState('');

  const esProductoFisico = producto?.tipo === 'PRODUCTO_FISICO';

  const [destinatario, setDestinatario] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pais, setPais] = useState('México');
  const [estado, setEstado] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [colonia, setColonia] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [calleNumero, setCalleNumero] = useState('');
  const [referencias, setReferencias] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});

  const precioUnitario = producto ? parseFloat(producto.precio) : 0;
  const precioTotal = (precioUnitario * cantidad).toFixed(2);

  const cardShadow =
    theme.palette.mode === 'dark'
      ? '0 4px 24px rgba(0,0,0,0.45)'
      : '0 4px 20px rgba(0,0,0,0.1)';

  const invalidatePaymentIntent = () => setClientSecret(null);

  const handleCantidad = (delta) => {
    setCantidad((prev) => Math.max(1, prev + delta));
    invalidatePaymentIntent();
  };

  const clearFieldError = (key) => {
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validateShipping = () => {
    const e = {};
    let ok = true;
    const fail = (key, msg) => {
      e[key] = msg;
      ok = false;
    };

    if (!destinatario.trim() || destinatario.trim().length < 3) {
      fail('destinatario', 'Indica el nombre completo de quien recibe (mín. 3 caracteres).');
    }
    const telDigits = soloDigitos(telefono);
    if (telDigits.length < 10) {
      fail('telefono', 'Ingresa un teléfono de contacto válido (mínimo 10 dígitos).');
    }
    if (!pais.trim()) fail('pais', 'El país es obligatorio.');
    if (!estado.trim() || estado.trim().length < 2) {
      fail('estado', 'El estado o provincia es obligatorio.');
    }
    if (!municipio.trim() || municipio.trim().length < 2) {
      fail('municipio', 'El municipio o alcaldía es obligatorio.');
    }
    if (!ciudad.trim() || ciudad.trim().length < 2) {
      fail('ciudad', 'La ciudad o localidad es obligatoria.');
    }
    if (!colonia.trim() || colonia.trim().length < 2) {
      fail('colonia', 'La colonia o fraccionamiento es obligatorio.');
    }
    const cp = codigoPostal.trim();
    if (!cp) {
      fail('codigoPostal', 'El código postal es obligatorio.');
    } else if (ES_MEXICO(pais)) {
      if (!/^\d{5}$/.test(cp)) {
        fail('codigoPostal', 'En México el código postal debe ser de 5 dígitos.');
      }
    } else if (cp.length < 3 || cp.length > 16) {
      fail('codigoPostal', 'Ingresa un código postal válido (3 a 16 caracteres).');
    }
    if (!calleNumero.trim() || calleNumero.trim().length < 5) {
      fail('calleNumero', 'Indica calle, número exterior y, si aplica, interior (mín. 5 caracteres).');
    }

    setFieldErrors(e);
    return ok;
  };

  const buildRequisitos = () => {
    if (!esProductoFisico) return descripcionCompra || null;
    return JSON.stringify({
      tipoEnvio: true,
      destinatario: destinatario.trim(),
      telefono: telefono.trim(),
      pais: pais.trim(),
      estado: estado.trim(),
      municipio: municipio.trim(),
      ciudad: ciudad.trim(),
      colonia: colonia.trim(),
      codigoPostal: codigoPostal.trim(),
      calleNumero: calleNumero.trim(),
      referenciasUbicacion: referencias.trim() || undefined,
      notasVendedor: descripcionCompra.trim() || undefined,
    });
  };

  const handleIniciarPago = async () => {
    setError(null);
    if (esProductoFisico && !validateShipping()) return;

    setCargando(true);
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
        requisitos: buildRequisitos(),
        stripePaymentIntentId: paymentIntent.id,
        cantidad,
      });
      const pedidoRes = await api.get('/pedidos/mis-compras');
      const ultimoPedido = pedidoRes.data?.[0] || null;
      navigate('/compra-exitosa', { state: { pedido: ultimoPedido } });
    } catch {
      setError('Pago procesado pero error al registrar el pedido. Contacta soporte.');
    }
  };

  if (!producto) {
    return (
      <Container sx={{ mt: 6, textAlign: 'center' }}>
        <Alert severity="warning">No se encontró información del producto.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/home')}>
          Volver al inicio
        </Button>
      </Container>
    );
  }

  if (compraExitosa) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ¡Pago realizado con éxito!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Compraste <strong>{producto.titulo}</strong> × {cantidad}{' '}
          {cantidad === 1 ? 'unidad' : 'unidades'}.
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'left', mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            RESUMEN
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>
              {producto.titulo} × {cantidad}
            </Typography>
            <Typography fontWeight="bold">${precioTotal} MXN</Typography>
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography fontWeight="bold">Total</Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              ${precioTotal} MXN
            </Typography>
          </Box>
        </Paper>
        <Button variant="contained" onClick={() => navigate('/home')} sx={{ borderRadius: 2 }}>
          Seguir explorando
        </Button>
      </Container>
    );
  }

  const shippingTextFieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 2 },
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5, mb: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
          Volver
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ mx: 'auto' }}>
          Detalle de Compra
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: cardShadow, mb: 3 }}>
        <CardMedia
          component="img"
          height={{ xs: 140, sm: 200 }}
          image={producto.urlPortada || producto.urlArchivo || 'https://via.placeholder.com/600x200'}
          alt={producto.titulo}
          sx={{ objectFit: 'cover' }}
        />
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar src={producto.vendedor?.fotoUrl} sx={{ bgcolor: 'primary.main' }}>
              {producto.vendedor?.nombreMostrado?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Vendedor
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {producto.vendedor?.nombreMostrado || 'N/A'}
              </Typography>
            </Box>
            <Chip
              label={producto.tipo?.replace(/_/g, ' ')}
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
            {producto.descripcion || 'Sin descripción.'}
          </Typography>
        </Box>
      </Card>

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Cantidad
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => handleCantidad(-1)}
            disabled={cantidad <= 1}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              minWidth: 44,
              minHeight: 44,
            }}
          >
            <RemoveIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" sx={{ minWidth: 40, textAlign: 'center' }}>
            {cantidad}
          </Typography>
          <IconButton
            onClick={() => handleCantidad(1)}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              minWidth: 44,
              minHeight: 44,
            }}
          >
            <AddIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            × ${producto.precio} c/u
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ReceiptLongIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">
            Resumen del pedido
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Producto
            </Typography>
            <Typography variant="body2">{producto.titulo}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Cantidad
            </Typography>
            <Typography variant="body2">{cantidad}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Precio unitario
            </Typography>
            <Typography variant="body2">${producto.precio} MXN</Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Total a pagar
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="success.main">
            ${precioTotal} MXN
          </Typography>
        </Box>
      </Paper>

      {esProductoFisico && (
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            mb: 3,
            border: 1,
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocalShippingOutlinedIcon color="primary" />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Dirección de envío
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Requerido para productos físicos. El vendedor usará estos datos para el envío.
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={0}>
            <TextField
              fullWidth
              required
              label="Nombre completo de quien recibe"
              value={destinatario}
              onChange={(e) => {
                setDestinatario(e.target.value);
                clearFieldError('destinatario');
                invalidatePaymentIntent();
              }}
              error={!!fieldErrors.destinatario}
              helperText={fieldErrors.destinatario}
              sx={{ ...shippingTextFieldSx, mb: fieldErrors.destinatario ? 1 : 2.5 }}
            />
            <TextField
              fullWidth
              required
              label="Teléfono de contacto"
              placeholder="10 dígitos o más, con o sin lada"
              value={telefono}
              onChange={(e) => {
                setTelefono(e.target.value);
                clearFieldError('telefono');
                invalidatePaymentIntent();
              }}
              error={!!fieldErrors.telefono}
              helperText={fieldErrors.telefono}
              sx={{ ...shippingTextFieldSx, mb: fieldErrors.telefono ? 1 : 2.5 }}
            />
            <TextField
              fullWidth
              required
              label="País"
              value={pais}
              onChange={(e) => {
                setPais(e.target.value);
                clearFieldError('pais');
                clearFieldError('codigoPostal');
                invalidatePaymentIntent();
              }}
              error={!!fieldErrors.pais}
              helperText={fieldErrors.pais}
              sx={{ ...shippingTextFieldSx, mb: fieldErrors.pais ? 1 : 2.5 }}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 2.5,
              }}
            >
              <TextField
                fullWidth
                required
                label="Estado o provincia"
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value);
                  clearFieldError('estado');
                  invalidatePaymentIntent();
                }}
                error={!!fieldErrors.estado}
                helperText={fieldErrors.estado}
                sx={shippingTextFieldSx}
              />
              <TextField
                fullWidth
                required
                label="Municipio o alcaldía"
                value={municipio}
                onChange={(e) => {
                  setMunicipio(e.target.value);
                  clearFieldError('municipio');
                  invalidatePaymentIntent();
                }}
                error={!!fieldErrors.municipio}
                helperText={fieldErrors.municipio}
                sx={shippingTextFieldSx}
              />
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 2.5,
              }}
            >
              <TextField
                fullWidth
                required
                label="Ciudad o localidad"
                value={ciudad}
                onChange={(e) => {
                  setCiudad(e.target.value);
                  clearFieldError('ciudad');
                  invalidatePaymentIntent();
                }}
                error={!!fieldErrors.ciudad}
                helperText={fieldErrors.ciudad}
                sx={shippingTextFieldSx}
              />
              <TextField
                fullWidth
                required
                label="Colonia o fraccionamiento"
                value={colonia}
                onChange={(e) => {
                  setColonia(e.target.value);
                  clearFieldError('colonia');
                  invalidatePaymentIntent();
                }}
                error={!!fieldErrors.colonia}
                helperText={fieldErrors.colonia}
                sx={shippingTextFieldSx}
              />
            </Box>
            <TextField
              fullWidth
              required
              label="Código postal"
              value={codigoPostal}
              onChange={(e) => {
                setCodigoPostal(e.target.value);
                clearFieldError('codigoPostal');
                invalidatePaymentIntent();
              }}
              error={!!fieldErrors.codigoPostal}
              helperText={fieldErrors.codigoPostal || (ES_MEXICO(pais) ? '5 dígitos en México' : '')}
              sx={{ ...shippingTextFieldSx, mb: fieldErrors.codigoPostal ? 1 : 2.5 }}
            />
            <TextField
              fullWidth
              required
              label="Calle, número exterior e interior"
              placeholder="Ej. Av. Reforma 222, Depto. 4B"
              value={calleNumero}
              onChange={(e) => {
                setCalleNumero(e.target.value);
                clearFieldError('calleNumero');
                invalidatePaymentIntent();
              }}
              error={!!fieldErrors.calleNumero}
              helperText={fieldErrors.calleNumero}
              sx={{ ...shippingTextFieldSx, mb: fieldErrors.calleNumero ? 1 : 2.5 }}
            />
            <TextField
              fullWidth
              label="Referencias para ubicar el domicilio (opcional)"
              placeholder="Ej. Portón negro, frente a la farmacia, entre calles X y Y"
              multiline
              minRows={2}
              value={referencias}
              onChange={(e) => {
                setReferencias(e.target.value);
                invalidatePaymentIntent();
              }}
              sx={{ ...shippingTextFieldSx, mb: 0 }}
            />
          </Stack>
        </Paper>
      )}

      <TextField
        label={esProductoFisico ? 'Notas adicionales para el vendedor (opcional)' : 'Notas para el vendedor (opcional)'}
        placeholder={
          esProductoFisico
            ? 'Horario de entrega, instrucciones especiales…'
            : 'Ej. Necesito entrega urgente…'
        }
        multiline
        rows={3}
        fullWidth
        value={descripcionCompra}
        onChange={(e) => {
          setDescripcionCompra(e.target.value);
          invalidatePaymentIntent();
        }}
        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!clientSecret ? (
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleIniciarPago}
          disabled={cargando}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1rem', minHeight: 44 }}
        >
          {cargando ? <CircularProgress size={24} color="inherit" /> : `Pagar $${precioTotal} MXN`}
        </Button>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <LockOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              Pago seguro procesado por Stripe
            </Typography>
          </Stack>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onExito={handlePagoExitoso} producto={producto} cantidad={cantidad} precioTotal={precioTotal} />
          </Elements>
        </Paper>
      )}
    </Container>
  );
};

export default DetalleCompra;
