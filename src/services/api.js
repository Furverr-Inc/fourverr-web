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
      const rutaActual = window.location.pathname;
      const basePrefix = import.meta.env.BASE_URL.replace(/\/$/, '');
      const rutaRelativa =
        basePrefix && rutaActual.startsWith(basePrefix)
          ? rutaActual.slice(basePrefix.length) || '/'
          : rutaActual;
      const esRutaPublica = ['/', '/login', '/registro'].includes(rutaRelativa);

      if (!esRutaPublica) {
        localStorage.clear();
        setTimeout(() => {
          const loginPath = `${import.meta.env.BASE_URL}login`.replace(/\/{2,}/g, '/');
          window.location.href = new URL(loginPath, window.location.origin).href;
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
