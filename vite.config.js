import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Include uppercase PNG extensions as static assets so imports like
  // import logo from '../images/logo.PNG' work without extra plugins.
  assetsInclude: ['**/*.PNG'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
