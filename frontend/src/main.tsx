/**
 * main.tsx — Punto de entrada del frontend.
 *
 * Capa: arranque de React.
 * Busca el <div id="root"> de index.html y monta la app ahí.
 *
 * StrictMode activa comprobaciones extra de React en desarrollo
 * (por ejemplo, ejecuta dos veces algunos efectos). No afecta producción.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
//import Login from './Login'
//import Register from './Register'
// El ! afirma que el elemento existe; si falta el id="root", falla en runtime.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
