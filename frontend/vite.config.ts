/**
 * vite.config.ts — Configuración del bundler Vite.
 *
 * Capa: build del frontend.
 * - react(): soporte de React (JSX, fast refresh).
 * - reactCompilerPreset(): optimizaciones del React Compiler.
 *
 * No hay configuración de proxy: el frontend llama directo a VITE_API_URL.
 * En producción, el build genera la carpeta dist/ que publica Render.
 */
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
