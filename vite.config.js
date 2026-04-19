import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/fourverr-web/' : '/',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': command === 'build'
      ? '"https://fourverr-backend-api.onrender.com/api"'
      : '"http://localhost:8080/api"',
    'import.meta.env.VITE_STRIPE_PUBLIC_KEY': command === 'build'
      ? '"pk_live_51T74jCF4vu3ZrUamhMu5hHpql1Jm3S59QSOACUnewa20tLNF0vhGJtKH5XhIqAeCAlx1DGHyDgr23dTENJpSb18u00xYkYP4YX"'
      : '"pk_test_51T74jCF4vu3ZrUam1Ct1fGPiZlIR5mtmoxGOQ8dFTTODznAKLQ98ZBW0rfw88LqKckWXMrUaZPt89dU0Wpywn33U00i7ilb4YC"'
  }
}))