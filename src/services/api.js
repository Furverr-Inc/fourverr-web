import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ── INTERCEPTOR DE REQUEST ──────────────────────────────────────
// Antes de cada petición, agrega el token JWT al header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── INTERCEPTOR DE RESPONSE ─────────────────────────────────────
// Revisa cada respuesta que llega del backend
api.interceptors.response.use(
  // Si la respuesta es exitosa (2xx), la deja pasar sin tocarla
  (response) => response,

  // Si hay error, lo analizamos
  (error) => {
    const status = error.response?.status;

    // 401 = token expirado o inválido
    // 403 = cuenta deshabilitada (ese lo manejamos en Login, no aquí)
    if (status === 401) {
      // Evitar loop infinito: si ya estamos en login/registro/landing, no redirigir
      const rutaActual = window.location.pathname;
      const esRutaPublica = ['/', '/login', '/registro'].includes(rutaActual);

      if (!esRutaPublica) {
        // Limpiar todo y mandar al login
        localStorage.clear();
        // Pequeño delay para que cualquier estado pendiente se limpie
        setTimeout(() => {
          window.location.href = '/fourverr-web/login';
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
