# Verificación del Proyecto CREADOR

## Instrucciones de Ejecución

### 1) Desarrollo local con Bun
El repositorio contiene lockfiles de Bun en [backend/bun.lock](backend/bun.lock) y [frontend/bun.lock](frontend/bun.lock), lo que respalda el uso de Bun como gestor de paquetes y runtime para el trabajo local.

#### Backend (NestJS)
La app backend escucha por `process.env.PORT || 8080` en [backend/src/main.ts](backend/src/main.ts#L7-L33).

Comandos de desarrollo local respaldados por el proyecto:

```bash
cd backend
bun install
bun run start:dev
```

Comandos de compilación local:

```bash
cd backend
bun install
bun run build
bun run start:prod
```

Valores reales locales:
- API base: `http://localhost:8080/api`
- Swagger: `http://localhost:8080/secret`

#### Frontend (React + Vite)
La configuración del frontend se define en [frontend/vite.config.ts](frontend/vite.config.ts#L1-L11) y el proyecto usa Vite por defecto en desarrollo.

Comandos de desarrollo local:

```bash
cd frontend
bun install
bun run dev -- --host 0.0.0.0
```

La ruta típica en desarrollo es:

```text
http://localhost:5173
```

El frontend realiza llamadas locales a la API mediante `fetch('http://localhost:8080/api/...')` desde [frontend/src/components/auth/Login.tsx](frontend/src/components/auth/Login.tsx#L18-L48) y [frontend/src/components/App/GaleriaArte-app.tsx](frontend/src/components/App/GaleriaArte-app.tsx#L12-L42).

### 2) Despliegue / Producción con Yarn
La configuración de Render en [render.yaml](render.yaml#L1-L20) usa Yarn para las instalacions y start commands del despliegue. Esa es la configuración validada para producción/deploy.

#### Frontend en Render
```bash
cd frontend
yarn install --frozen-lockfile
yarn build
```

#### Backend en Render
```bash
dcd backend
yarn install --frozen-lockfile
yarn build
yarn start
```

Notas:
- El despliegue es compatible con el servicio Node y el servicio estático definidos en [render.yaml](render.yaml#L1-L20).
- No se utiliza Docker Compose ni un Dockerfile en este repositorio.

### 3) Verificación funcional básica
Se puede comprobar la API levantada con:

```bash
curl http://localhost:8080/api/Art/ArtPosts
```

Y la SPA en desarrollo normalmente estará disponible en:

```text
http://localhost:5173
```

### 4) Docker / contenedores
Se verificó que no existe ningún `docker-compose.yml`, `docker-compose.yaml`, ni `Dockerfile` en el repositorio. La ejecución local documentada aquí se basa en Bun y la configuración de Render usa Yarn para despliegue, no en contenedores Docker.

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
| El proyecto incluye Docker Compose para levantar servicios. | ❌ Incorrecto / Corregido | No existe `docker-compose.yml` ni `Dockerfile` en el repositorio. La ejecución real está basada en Bun para desarrollo local y en Yarn para despliegue en [render.yaml](render.yaml#L1-L20). |
| El frontend se levanta en el puerto 3000. | ❌ Incorrecto / Corregido | No hay configuración explícita de puerto 3000; el frontend usa Vite y no sobreescribe el puerto en [frontend/vite.config.ts](frontend/vite.config.ts#L1-L11). El valor estándar de Vite es 5173, no 3000. |
| El proyecto está desplegado con Render como frontend estático y backend Node. | ✅ Verificado | [render.yaml](render.yaml#L1-L20) define dos servicios: `ecobite-frontend` y `ecobite-backend`. |
| El frontend tiene un panel completo de “Amigos”, “Teams”, música, juegos y ofertas. | ❓ Sin verificar | Existen rutas y módulos para esas áreas en [frontend/src/App.tsx](frontend/src/App.tsx#L8-L62) y [backend/src/app.module.ts](backend/src/app.module.ts#L18-L55), pero no hay evidencia de flujo completo y verificado de UI para todas ellas en este repositorio. |
| La app es una plataforma completa de creadores con todas sus historias de usuario implementadas. | ❓ Sin verificar | La arquitectura y los módulos lo sugieren, pero la revisión realizada confirma autenticación, arte y servicios de infraestructura; no se validó la funcionalidad end-to-end de todos los módulos. |
| Se debe utilizar un archivo `.env` en la raíz del proyecto para arrancar la app. | ❓ Sin verificar | El código realmente usa `.env` dentro de [backend](backend) y también hay [frontend/.env](frontend/.env#L1-L2), pero no hay evidencia de un único archivo raíz compartido. |

---

## Conclusión corta

El repositorio se puede levantar localmente con Bun en [backend](backend) y [frontend](frontend), y la conexión real de la app está fijada por la API local en `http://localhost:8080`. No hay Docker ni Compose en el proyecto; la configuración de ejecución y despliegue real está definida en [render.yaml](render.yaml#L1-L20) con Yarn para producción. La parte más sólida y verificada es la autenticación con Supabase y la gestión de arte con almacenamiento de imágenes.
