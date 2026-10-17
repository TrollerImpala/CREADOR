# Verificación del Proyecto CREADOR

## Instrucciones de Ejecución

### 1) Backend (API NestJS)

La app backend está configurada como un servicio Node en [render.yaml](render.yaml#L1-L20), con `rootDir: backend` y `startCommand: npm start`.

Comandos reales respaldados por el código:

```bash
cd backend
npm install
npm run start:dev
```

También es posible arrancarlo en producción:

```bash
cd backend
npm install
npm run build
npm run start:prod
```

La entrada real del backend está en [backend/src/main.ts](backend/src/main.ts#L7-L33):

- activa CORS
- monta el prefijo global `api`
- habilita `ValidationPipe`
- crea Swagger en `/secret`
- usa `process.env.PORT || 8080`

Eso implica que la API real del proyecto, en ejecución local, es:

- API base: `http://localhost:8080/api`
- Swagger: `http://localhost:8080/secret`

La evidencia de que el backend se conecta a Supabase y usa variables de entorno aparece en [backend/src/sub_services/supabaseClient.ts](backend/src/sub_services/supabaseClient.ts#L1-L23) y en [backend/.env](backend/.env#L1-L4), donde se definen `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `PORT=8080`.

### 2) Frontend (React + Vite)

La configuración de despliegue del frontend aparece en [render.yaml](render.yaml#L1-L8): es un servicio estático con `rootDir: frontend`, `buildCommand: npm ci && npm run build` y `staticPublishPath: dist`.

Comandos reales respaldados por el código:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

La configuración de Vite en [frontend/vite.config.ts](frontend/vite.config.ts#L1-L11) no define un puerto explícito, así que en desarrollo Vite usa el valor por defecto (`5173`) si no se sobreescribe desde la línea de comandos. Eso coincide con la forma en que el frontend realiza llamadas hardcodeadas al backend en `http://localhost:8080`.

### 3) Verificación funcional básica

Se puede comprobar la API levantada con:

```bash
curl http://localhost:8080/api/Art/ArtPosts
```

La ruta del frontend en desarrollo suele ser:

```text
http://localhost:5173
```

Y la autenticación del frontend apunta explícitamente al backend local en [frontend/src/components/auth/Login.tsx](frontend/src/components/auth/Login.tsx#L18-L48), [frontend/src/components/auth/Register.tsx](frontend/src/components/auth/Register.tsx), y [frontend/src/components/App/GaleriaArte-app.tsx](frontend/src/components/App/GaleriaArte-app.tsx#L12-L42), donde se hace `fetch('http://localhost:8080/api/...')`.

### 4) Docker / contenedores

Se verificó que no existe ningún `docker-compose.yml`, `docker-compose.yaml`, ni `Dockerfile` en el repositorio. La búsqueda del proyecto no encontró archivos de ese tipo. Por tanto, la ejecución local documentada aquí se basa en los scripts de npm y la configuración de Render, no en contenedores Docker.

---

## Resumen del Proyecto

Este repositorio contiene una app web de contenido creativo con dos capas claramente separadas:

1. Frontend React/Vite en [frontend](frontend)
2. Backend NestJS en [backend](backend)

### Arquitectura y conexión de componentes

- El frontend inicia la SPA en [frontend/src/main.tsx](frontend/src/main.tsx#L1-L9) y carga el componente raíz desde [frontend/src/App.tsx](frontend/src/App.tsx#L1-L62).
- La navegación de la app está definida con `createBrowserRouter` en [frontend/src/App.tsx](frontend/src/App.tsx#L8-L62), con rutas como `/`, `/Login`, `/Register`, `/Arte`, `/Arte/:artpost_id`, `/Amigos`, `/Teams`, y una ruta protegida para `/Arte/PostearArte`.
- La pantalla principal en [frontend/src/components/Home.tsx](frontend/src/components/Home.tsx#L1-L82) presenta una landing con login, registro y acceso a la galería de arte. La sección de arte está implementada en [frontend/src/components/App/GaleriaArte-app.tsx](frontend/src/components/App/GaleriaArte-app.tsx#L9-L44), donde se consumen los posts de arte desde la API.
- La lógica de autenticación del cliente usa fetch directo a la API local: por ejemplo, [frontend/src/components/auth/Login.tsx](frontend/src/components/auth/Login.tsx#L18-L48) llama a `http://localhost:8080/api/Auth/Login` y guarda `access_token` y `usuario` en `localStorage`.

### Backend y servicios

- El módulo principal registra todos los controladores en [backend/src/app.module.ts](backend/src/app.module.ts#L1-L55): `AuthController`, `ArtController`, `MusicController`, `FilmController`, `GameController`, `JobOfferController`.
- El bootstrap del backend se hace en [backend/src/main.ts](backend/src/main.ts#L7-L33), configurando prefijo `/api`, validación global y Swagger en `/secret`.
- El controlador de autenticación está en [backend/src/auth/auth.controller.ts](backend/src/auth.controller.ts#L1-L24) y la lógica real en [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts#L1-L92).
- El controlador de arte está en [backend/src/art/art.controller.ts](backend/src/art/art.controller.ts#L1-L78). La lógica de negocio de arte está en [backend/src/art/art.service.ts](backend/src/art/art.service.ts#L1-L98), donde se consume `ARTPOSTS` de Supabase y se suben imágenes a un bucket `ART` usando [backend/src/sub_services/storage.service.ts](backend/src/sub_services/storage.service.ts#L1-L41).
- El cliente de Supabase se crea en [backend/src/sub_services/supabaseClient.ts](backend/src/sub_services/supabaseClient.ts#L1-L23), usando `SUPABASE_URL` y `SUPABASE_ANON_KEY` leídas del entorno.

### Qué hace la app en la práctica

La evidencia del código indica que la app es una plataforma centrada en contenido creativo y comunidad:

- autenticación de usuarios con Supabase
- galería de arte con publicaciones y carga de imágenes
- rutas de “Amigos”, “Teams” y “arte” en la SPA
- presencia de módulos para música, películas, juegos y ofertas de trabajo, aunque no se ha verificado un flujo completo de UI para todos ellos en esta revisión

La arquitectura sugiere una red social / plataforma de creadores con contenido multimedia, pero el alcance funcional real verificable por este repo es particularmente claro en autenticación y arte.

---

## Tabla / Rastro de Verificación

| Afirmación | Estado | Evidencia / Comentario |
|---|---|---|
| El backend es un servicio NestJS que escucha en el puerto 8080 por defecto. | ✅ Verificado | [backend/src/main.ts](backend/src/main.ts#L29-L33) usa `process.env.PORT || 8080`; además [backend/.env](backend/.env#L1-L4) define `PORT=8080`. |
| El backend expone su API bajo el prefijo `/api`. | ✅ Verificado | [backend/src/main.ts](backend/src/main.ts#L10-L18) ejecuta `app.setGlobalPrefix('api')`. |
| La documentación Swagger está disponible en `/secret`. | ✅ Verificado | [backend/src/main.ts](backend/src/main.ts#L19-L26) crea Swagger con `SwaggerModule.setup('secret', ...)`. |
| El frontend es una SPA React + Vite. | ✅ Verificado | [frontend/package.json](frontend/package.json#L1-L34) y [frontend/vite.config.ts](frontend/vite.config.ts#L1-L11). |
| El frontend llama al backend en `http://localhost:8080`. | ✅ Verificado | [frontend/src/components/auth/Login.tsx](frontend/src/components/auth/Login.tsx#L18-L48), [frontend/src/components/App/GaleriaArte-app.tsx](frontend/src/components/App/GaleriaArte-app.tsx#L12-L42) y otras pantallas hacen `fetch('http://localhost:8080/api/...')`. |
| La aplicación usa Supabase para autenticación y almacenamiento. | ✅ Verificado | [backend/src/sub_services/supabaseClient.ts](backend/src/sub_services/supabaseClient.ts#L1-L23), [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts#L1-L92), [backend/src/art/art.service.ts](backend/src/art/art.service.ts#L1-L98), [backend/src/sub_services/storage.service.ts](backend/src/sub_services/storage.service.ts#L1-L41). |
| El proyecto incluye Docker Compose para levantar servicios. | ❌ Incorrecto / Corregido | No existe `docker-compose.yml` ni `Dockerfile` en el repositorio. La ejecución real está basada en `npm` y en [render.yaml](render.yaml#L1-L20). |
| El frontend se levanta en el puerto 3000. | ❌ Incorrecto / Corregido | No hay configuración explícita de puerto 3000; el frontend usa Vite y no sobreescribe el puerto en [frontend/vite.config.ts](frontend/vite.config.ts#L1-L11). El valor estándar de Vite es 5173, no 3000. |
| El proyecto está desplegado con Render como frontend estático y backend Node. | ✅ Verificado | [render.yaml](render.yaml#L1-L20) define dos servicios: `ecobite-frontend` y `ecobite-backend`. |
| El frontend tiene un panel completo de “Amigos”, “Teams”, música, juegos y ofertas. | ❓ Sin verificar | Existen rutas y módulos para esas áreas en [frontend/src/App.tsx](frontend/src/App.tsx#L8-L62) y [backend/src/app.module.ts](backend/src/app.module.ts#L18-L55), pero no hay evidencia de flujo completo y verificado de UI para todas ellas en este repositorio. |
| La app es una plataforma completa de creadores con todas sus historias de usuario implementadas. | ❓ Sin verificar | La arquitectura y los módulos lo sugieren, pero la revisión realizada confirma autenticación, arte y servicios de infraestructura; no se validó la funcionalidad end-to-end de todos los módulos. |
| Se debe utilizar un archivo `.env` en la raíz del proyecto para arrancar la app. | ❓ Sin verificar | El código realmente usa `.env` dentro de [backend](backend) y también hay [frontend/.env](frontend/.env#L1-L2), pero no hay evidencia de un único archivo raíz compartido. |

---

## Conclusión corta

El repositorio se puede levantar localmente con `npm` en [backend](backend) y [frontend](frontend), y la conexión real de la app está fijada por la API local en `http://localhost:8080`. No hay Docker ni Compose en el proyecto; la configuración de ejecución y despliegue real está en los scripts de npm y en [render.yaml](render.yaml#L1-L20). La parte más sólida y verificada es la autenticación con Supabase y la gestión de arte con almacenamiento de imágenes.
