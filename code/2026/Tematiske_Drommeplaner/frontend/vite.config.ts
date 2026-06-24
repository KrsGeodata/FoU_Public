import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    base: env.VITE_BASE_PATH || (mode === 'production' ? '/mikro-drommeplan/' : '/'),
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://backend:8000',
          changeOrigin: true,
        },
        '/public': {
          target: 'http://backend:8000',
          changeOrigin: true,
        },
      }
    }
  }
})