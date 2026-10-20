# Nombre
Frontend Structure Guidelines

# Alcance
Aplica al frontend en [frontend/src](frontend/src), incluyendo componentes, rutas, hooks, utilidades y estilos.

# Justificación
El frontend de React/Vite tiene componentes funcionales bien separados y lógica de ruta centralizada en [frontend/src/App.tsx](frontend/src/App.tsx), pero también presenta acoplamiento fuerte entre UI y fetch, además de acceso directo a `localStorage` y URLs hardcodeadas. Esto hace más difícil mantener la app, escalabilidad y seguridad.

# Guía específica del proyecto

## 1) Mantener componentes de presentación libres de lógica de red
Los componentes de autenticación y galería hacen fetch directo, por ejemplo:
- [frontend/src/components/auth/Login.tsx](frontend/src/components/auth/Login.tsx)
- [frontend/src/components/App/GaleriaArte-app.tsx](frontend/src/components/App/GaleriaArte-app.tsx)
- [frontend/src/components/tools/logout.tsx](frontend/src/components/tools/logout.tsx)

Regla:
- Los componentes deben delegar tráfico HTTP a servicios o hooks dedicados.
- El componente debe encargarse del render, no de la conexión con la API.

## 2) Centralizar la configuración de la API
La URL base aparece hardcodeada como `http://localhost:8080/api/...` en varios lugares.

Regla:
- Crear un `apiClient` o `services` base con `baseURL` desde `import.meta.env.VITE_API_BASE_URL` o equivalente.
- Evitar literales de host/puerto embebidos en cada pantalla.

## 3) Encapsular la sesión de usuario
La sesión se guarda y lee de `localStorage` directamente en [frontend/src/components/Home.tsx](frontend/src/components/Home.tsx) y [frontend/src/components/auth/Login.tsx](frontend/src/components/auth/Login.tsx).

Regla:
- Evitar lectura directa repartida por la UI.
- Crear un servicio de autenticación con métodos como `login`, `logout`, `getAccessToken`, `isAuthenticated`.

## 4) Mantener rutas protegidas en un patrón claro
La protección de rutas está implementada en [frontend/src/App.tsx](frontend/src/App.tsx), con `ProtectedRoute` y `Navigate`.

Regla:
- Toda ruta privada debe pasar por una capa de acceso centralizada.
- No duplicar lógica de sesión en cada componente.

## 5) Evitar efectos secundarios y `alert()` como flujo principal
La UI usa `alert()` para notificar éxito en [frontend/src/components/auth/Login.tsx](frontend/src/components/auth/Login.tsx), y `console.log` para depurar en varios componentes.

Regla:
- Los eventos de éxito/error deben manejarse con estados UI reales (toast, banner, modal) y no con `alert()`.
- Los logs de depuración deben eliminarse del flujo de producción.

## 6) Crear los componentes por dominio, no por archivo ad hoc
El repo tiene un conjunto de componentes y rutas relacionados a arte, amigos y equipos; por ejemplo:
- [frontend/src/components/App/GaleriaArte-app.tsx](frontend/src/components/App/GaleriaArte-app.tsx)
- [frontend/src/components/App/Amigos-app.tsx](frontend/src/components/App/Amigos-app.tsx)
- [frontend/src/components/App/Teams-app.tsx](frontend/src/components/App/Teams-app.tsx)

Regla:
- Agrupar archivos por dominio (`auth`, `art`, `social`, `teams`) y mantener un patrón consistente.
- Evitar nombres de archivos dispares como `Postear-Arte.tsx`, `GaleriArte-app.tsx`, `Nav.tsx` sin una convención única.

## 7) Reutilizar hooks para formularios
El hook `useForm` en [frontend/src/components/hooks/useForm.tsx](frontend/src/components/hooks/useForm.tsx) encapsula manejo de inputs y submit.

Regla:
- Todo formulario complejo o recurrente debe usar un hook o servicio reutilizable.
- No duplicar lógica de manejo de inputs en componentes separados.

## 8) Reforzar el tipado del frontend
La app usa TypeScript y definiciones como `ArtInfo` en [frontend/src/components/tools/types.tsx](frontend/src/components/tools/types.tsx).

Regla:
- Cada respuesta de API debe tener una interfaz o tipo compartido.
- No usar `any` para la respuesta de la API o para la estructura de formularios reutilizables.
