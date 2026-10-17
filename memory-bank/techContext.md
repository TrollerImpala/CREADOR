# Technical Context

## Stack principal

### Frontend
- React + TypeScript + Vite: [frontend/package.json](../frontend/package.json)
- Router: `react-router-dom` en [frontend/package.json](../frontend/package.json)
- Build y preview: [frontend/package.json](../frontend/package.json)
- Configuración de Vite: [frontend/vite.config.ts](../frontend/vite.config.ts)

### Backend
- NestJS + TypeScript: [backend/package.json](../backend/package.json)
- Framework principal y dependencias clave: [backend/package.json](../backend/package.json)
- Swagger habilitado y prefijo global `/api`: [backend/src/main.ts](../backend/src/main.ts)

### Gestores de paquetes y runtimes por entorno
- Desarrollo local: Bun, respaldado por [backend/bun.lock](../backend/bun.lock) y [frontend/bun.lock](../frontend/bun.lock)
- Despliegue / producción: Yarn, documentado en [render.yaml](../render.yaml)

Esto implica una separación clara de entornos:
- Local: usar Bun para velocidad de instalación y ejecución durante desarrollo
- Deploy: usar Yarn para desarrollo del pipeline de Render y producción

## Dependencias clave

### Backend
Se evidencia explícitamente:
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
- `@nestjs/config`
- `@nestjs/swagger`
- `@supabase/supabase-js`
- `class-transformer`, `class-validator`
- `dotenv`

Todo esto aparece en [backend/package.json](../backend/package.json).

### Frontend
Se evidencia explícitamente:
- `react`, `react-dom`
- `react-router-dom`
- `@supabase/supabase-js`
- `vite`, `typescript`, `@vitejs/plugin-react`

Todo esto aparece en [frontend/package.json](../frontend/package.json).

## Base de datos y almacenamiento
La base de datos real del proyecto no es un Postgres local del repo; la app conecta a Supabase como backend de datos y almacenamiento.

Evidencia:
- Cliente Supabase creado en [backend/src/sub_services/supabaseClient.ts](../backend/src/sub_services/supabaseClient.ts)
- Variables de entorno de Supabase en [backend/.env](../backend/.env)
- Lectura de tablas como `ARTPOSTS` en [backend/src/art/art.service.ts](../backend/src/art/art.service.ts)
- Uso de `this.supabase.storage` en [backend/src/sub_services/storage.service.ts](../backend/src/sub_services/storage.service.ts)

La estructura real por dominio sugiere un modelo de datos alojado en Supabase con tablas como `ARTPOSTS`, `USERS`, `STATS` y buckets de storage. Se observa uso activo de:
- `ARTPOSTS`
- `USERS`
- `ART` bucket

## Variables de entorno

### Backend
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `PORT=8080`

Archivo: [backend/.env](../backend/.env)

### Frontend
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

Archivo: [frontend/.env](../frontend/.env)

## Configuración de runtime y despliegue

### Local
- Backend usa `PORT` o 8080 por defecto en [backend/src/main.ts](../backend/src/main.ts)
- Frontend usa Vite con puerto por defecto 5173 si no se sobreescribe: [frontend/vite.config.ts](../frontend/vite.config.ts)
- La API del frontend apunta a `http://localhost:8080/api/...` en varios componentes: [frontend/src/components/auth/Login.tsx](../frontend/src/components/auth/Login.tsx), [frontend/src/components/App/GaleriaArte-app.tsx](../frontend/src/components/App/GaleriaArte-app.tsx)

### Producción / Render
La configuración del despliegue está en [render.yaml](../render.yaml):
- Frontend estático `ecobite-frontend`
- Backend Node `ecobite-backend`
- `rootDir: frontend` y `rootDir: backend`
- build y start commands definidos en la misma configuración

## Docker y contenedores
No existe `docker-compose.yml`, `docker-compose.yaml` ni `Dockerfile` en el repositorio. La búsqueda del proyecto no encontró esos archivos. La ejecución local del repositorio se basa en Bun y la configuración de despliegue usa Yarn en [render.yaml](../render.yaml), no en contenedores Docker.

## Impacto en Developer Experience
- Bun acelera la instalación y ejecución local con lockfiles presentes: [backend/bun.lock](../backend/bun.lock), [frontend/bun.lock](../frontend/bun.lock)
- Yarn se usa como estándar de despliegue y pipeline para Render, evitando que el entorno productivo dependa de herramientas de desarrollo local
- La separación explícita de entorno reduce ambigüedad y evita mezclar `install` y `start` de distintos gestores en la misma etapa

## Resumen técnico
El proyecto es un monorepo de dos servicios con frontend y backend separados, conectados por HTTP sobre localhost en desarrollo y por Render en despliegue, usando Supabase como capa de autenticación, base de datos y storage. La dualidad de paquetes está documentada de forma intencional: Bun para desarrollo local y Yarn para despliegue/produción.
