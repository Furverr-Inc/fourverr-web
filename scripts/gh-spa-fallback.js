/**
 * GitHub Pages no redirige rutas desconocidas a index.html.
 * Sirviendo el mismo HTML en 404.html, la SPA carga y React Router
 * resuelve la ruta (p. ej. /fourverr-web/registro al recargar).
 */
import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, '..', 'dist');
const indexHtml = join(dist, 'index.html');
const notFoundHtml = join(dist, '404.html');

if (!existsSync(indexHtml)) {
  console.error('gh-spa-fallback: no existe dist/index.html. Ejecuta vite build antes.');
  process.exit(1);
}

copyFileSync(indexHtml, notFoundHtml);
console.log('gh-spa-fallback: dist/404.html copiado desde index.html');
