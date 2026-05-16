import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],

  // 👇 Apunta a tu carpeta del renderer (React)
  root: path.resolve(__dirname, 'src/main/renderer'),

  // 👇 Necesario para que Electron cargue los assets correctamente
  base: './',

  build: {
    // 👇 Carpeta de salida del build final
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,

    rollupOptions: {
      input: path.resolve(__dirname, 'src/main/renderer/index.html')
    }
  },

  resolve: {
    alias: {
      // 👇 @ apunta a tu renderer
      '@': path.resolve(__dirname, 'src/main/renderer'),

      // 👇 @shared apunta a tu carpeta shared (código compartido)
      '@shared': path.resolve(__dirname, 'src/shared'),

      // 👇 @assets apunta a tus recursos estáticos
      '@assets': path.resolve(__dirname, 'assets')
    }
  },

  server: {
    port: 5173,
    strictPort: true   // 👇 Fuerza el puerto 5173, no cambia si está ocupado
  }
})
