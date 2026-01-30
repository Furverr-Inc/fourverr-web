import api from './api';

export const obtenerUsuarios = async () => {
  try {
    const respuesta = await api.get('/usuarios');
    return respuesta.data;
  } catch (error) {
    console.error("Error al conectar con el backend", error);
    throw error;
  }
};
export const registrarUsuario = async (datos) => {
  try {
    const respuesta = await api.post('/usuarios', datos);
    return respuesta.data;
  } catch (error) {
    console.error("Error al registrar:", error);
    throw error;
  }
};