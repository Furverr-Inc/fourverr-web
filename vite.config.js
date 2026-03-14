import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/fourverr-web/' : '/',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': command === 'build'
      ? '"https://fourverr-backend-api.onrender.com/api"'
      : '"http://localhost:8080/api"'
  }
}))