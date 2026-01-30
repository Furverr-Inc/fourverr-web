import api from './api';

// Función para pedirle a Spring Boot todos los productos
export const obtenerProductos = async () => {
  // Realiza una petición GET a http://localhost:8080/api/productos
  const respuesta = await api.get('/productos');
  return respuesta.data;
};