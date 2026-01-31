import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Conexión al Backend
  headers: {
    'Content-Type': 'application/json'
  }
});

// INTERCEPTOR (El Truco de Magia) 🎩
// Antes de que salga cualquier petición, revisamos si tenemos un token guardado.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Si hay token, se lo pegamos en la frente al mensaje (Header Authorization)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;