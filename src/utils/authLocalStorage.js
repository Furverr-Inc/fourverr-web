/**
 * Claves de sesión de usuario. No borrar con ellas preferencias persistentes
 * (tema, estado de reportes leídos por usuario, etc.).
 */
export const AUTH_LOCAL_KEYS = [
  'token',
  'usuarioNombre',
  'usuarioUsername',
  'usuarioRol',
  'usuarioId',
  'usuarioFoto',
];

export function clearAuthLocalStorage() {
  AUTH_LOCAL_KEYS.forEach((k) => localStorage.removeItem(k));
}
