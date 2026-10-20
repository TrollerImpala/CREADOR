# System Patterns

## Arquitectura general
El repositorio está dividido en dos servicios principales:

1. Frontend React/Vite en [frontend](../frontend)
2. Backend NestJS en [backend](../backend)

La integración real ocurre por llamadas HTTP a la API del backend. El frontend no usa una capa de API centralizada y hace fetch directo desde componentes, por ejemplo:
- [frontend/src/components/auth/Login.tsx](../frontend/src/components/auth/Login.tsx)
- [frontend/src/components/App/GaleriaArte-app.tsx](../frontend/src/components/App/GaleriaArte-app.tsx)
- [frontend/src/components/tools/logout.tsx](../frontend/src/components/tools/logout.tsx)

## Estructura del backend
El módulo principal registra los controladores del dominio en [backend/src/app.module.ts](../backend/src/app.module.ts).

Patrón observado:
- `Controller` para HTTP
- `Service` para lógica de negocio
- `sub_services` para infraestructura y acceso a terceros

Ejemplo real:
- [backend/src/art/art.controller.ts](../backend/src/art/art.controller.ts)
- [backend/src/art/art.service.ts](../backend/src/art/art.service.ts)
- [backend/src/sub_services/storage.service.ts](../backend/src/sub_services/storage.service.ts)
- [backend/src/sub_services/supabaseClient.ts](../backend/src/sub_services/supabaseClient.ts)

## Estructura del frontend
La ruta raíz de la app se configura en [frontend/src/App.tsx](../frontend/src/App.tsx), donde se definen rutas y una guardia `ProtectedRoute`.

Patrón observado:
- `App.tsx` centraliza la navegación
- Componentes por vista (`Home`, `Login`, `Register`, `GaleriaArte`, `Amigos`, `Teams`)
- `hooks` reutilizables, como [frontend/src/components/hooks/useForm.tsx](../frontend/src/components/hooks/useForm.tsx)
- Utilidades de soporte en [frontend/src/components/tools](../frontend/src/components/tools)

## Flujo de datos principal

### 1) Login
1. El usuario escribe email/password en [frontend/src/components/auth/Login.tsx](../frontend/src/components/auth/Login.tsx)
2. El hook `useForm` hace `fetch` a `http://localhost:8080/api/Auth/Login`
3. El backend valida credenciales con Supabase Auth: [backend/src/auth/auth.service.ts](../backend/src/auth/auth.service.ts)
4. La respuesta devuelve `user_token`, `refresh_token` y `user`
5. El frontend guarda tokens y usuario en `localStorage`

### 2) Leer arte
1. La galería ejecuta `fetch('http://localhost:8080/api/Art/ArtPosts')`: [frontend/src/components/App/GaleriaArte-app.tsx](../frontend/src/components/App/GaleriaArte-app.tsx)
2. El endpoint consulta la tabla `ARTPOSTS`: [backend/src/art/art.service.ts](../backend/src/art/art.service.ts)
3. El backend responde con `{ mensaje, art }`
4. El frontend renderiza los resultados y muestra `Cargando...` si la lista está vacía

### 3) Publicación de arte
1. Frontend navega a la ruta protegida `/Arte/PostearArte`: [frontend/src/App.tsx](../frontend/src/App.tsx)
2. La UI prepara el payload y el archivo: [frontend/src/components/App/Posts/Postear-Arte.tsx](../frontend/src/components/App/Posts/Postear-Arte.tsx)
3. El backend valida la sesión con el guard: [backend/src/auth/auth.guard.ts](../backend/src/auth/auth.guard.ts)
4. El servicio crea un registro en `ARTPOSTS` y sube el archivo a Supabase Storage: [backend/src/art/art.service.ts](../backend/src/art/art.service.ts)

## Conexión frontend-backend
La conexión es por HTTP directo sobre localhost en desarrollo y por una base URL del despliegue en producción. La evidencia aparece en:
- [backend/src/main.ts](../backend/src/main.ts)
- [frontend/src/components/auth/Login.tsx](../frontend/src/components/auth/Login.tsx)
- [frontend/src/components/App/GaleriaArte-app.tsx](../frontend/src/components/App/GaleriaArte-app.tsx)
- [render.yaml](../render.yaml)

## Patrones de seguridad observados
- CORS habilitado en [backend/src/main.ts](../backend/src/main.ts)
- Guard de autenticación basado en token en [backend/src/auth/auth.guard.ts](../backend/src/auth/auth.guard.ts)
- Sesión manejada por Supabase Auth y localStorage en frontend

## Patrones de riesgo arquitectónico
- El frontend hace fetch directo desde componentes; no hay API client centralizado
- Los endpoints comparten nombres verbales y recursos mezclados (`PostArt`, `ArtPosts`, `Auth/Login`)
- Hay `any` en contratos de entrada y salida en varios servicios, por ejemplo en [backend/src/auth/auth.service.ts](../backend/src/auth/auth.service.ts)
- La configuración de la API está hardcodeada en varias pantallas

## Conclusión
La arquitectura real del sistema es un monorepo con un frontend React que consume una API NestJS y usa Supabase como capa de datos y almacenamiento. El patrón dominante es módulo por dominio, con acoplamiento actual alto entre UI y backend por falta de cliente API centralizado.
