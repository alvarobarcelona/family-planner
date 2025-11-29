import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Proxy comentado - Usa VITE_API_URL del .env.local
  // server: {
  //   proxy: {
  //     '/api': 'http://localhost:4000',
  //   },
  // },
});
