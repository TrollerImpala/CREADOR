import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
//import Login from './Login'
//import Register from './Register'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
