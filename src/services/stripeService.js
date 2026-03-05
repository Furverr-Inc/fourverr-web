import api from './api';

export const crearPaymentIntent = async (idProducto, currency = 'mxn', cantidad = 1) => {
  const response = await api.post('/stripe/crear-payment-intent', {
    idProducto,
    currency,
    cantidad,
  });
  return response.data; // { clientSecret, paymentIntentId, monto }
};
