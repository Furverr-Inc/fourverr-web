import api from './api';

// Llama al backend para crear el PaymentIntent y obtener el clientSecret
export const crearPaymentIntent = async (idProducto, currency = 'mxn') => {
  const response = await api.post('/stripe/crear-payment-intent', {
    idProducto,
    currency,
  });
  return response.data; // { clientSecret, paymentIntentId, monto }
};