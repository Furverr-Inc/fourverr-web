import api from './api';

// ─── Payment Intent ────────────────────────────────────────────
export const crearPaymentIntent = async (idProducto, currency = 'mxn', cantidad = 1) => {
  const response = await api.post('/stripe/crear-payment-intent', {
    idProducto,
    currency,
    cantidad,
  });
  return response.data; // { clientSecret, paymentIntentId, monto, usaConnect }
};

// ─── Stripe Connect ────────────────────────────────────────────

/**
 * Inicia el onboarding de Stripe Connect para el vendedor autenticado.
 * El backend crea la cuenta Express (si no existe) y devuelve la URL de onboarding.
 * @returns {Promise<string>} URL a la que redirigir al vendedor
 */
export const iniciarOnboardingConnect = async () => {
  const response = await api.post('/stripe/connect/onboarding');
  return response.data.url;
};

/**
 * Consulta el estado de la cuenta de Stripe Connect del vendedor.
 * @returns {Promise<{conectado: boolean, habilitado: boolean, stripeAccountId: string}>}
 */
export const obtenerEstadoConnect = async () => {
  const response = await api.get('/stripe/connect/estado');
  return response.data;
};
