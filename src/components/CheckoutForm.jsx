import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button, Alert, CircularProgress, Box } from '@mui/material';

const CheckoutForm = ({ onExito, producto }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Stripe aún no cargó, no hacer nada
    if (!stripe || !elements) return;

    setProcesando(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/home', // fallback si hay redirección
      },
      redirect: 'if_required', // evita redirección innecesaria en pagos simples con tarjeta
    });

    if (stripeError) {
      // Error visible para el usuario: tarjeta rechazada, fondos insuficientes, etc.
      setError(stripeError.message);
      setProcesando(false);
    } else if (paymentIntent?.status === 'succeeded') {
      // Pago exitoso — avisamos al componente padre
      onExito(paymentIntent);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pb: { xs: 2, sm: 0 } }}>
      {/* PaymentElement incluye el campo de tarjeta, validación, y soporte para
          múltiples métodos de pago. Stripe lo renderiza y lo controla. */}
      <PaymentElement />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || procesando}
        sx={{ 
          mt: 3, 
          py: 1.5, 
          borderRadius: 2, 
          minHeight: 44,
          position: 'sticky',
          bottom: 8,
          zIndex: 1,
          backgroundColor: 'primary.main',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        startIcon={procesando ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {procesando ? 'Procesando...' : `Pagar $${producto?.precio} MXN`}
      </Button>
    </Box>
  );
};

export default CheckoutForm;