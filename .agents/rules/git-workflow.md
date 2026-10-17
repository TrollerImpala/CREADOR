# Nombre
Git Workflow and Delivery Standards

# Alcance
Aplica a todas las ramas, pull requests, commits, desarrollo local y despliegue del repositorio.

# Justificación
El repositorio tiene evidencia de dos entornos distintos:
- Desarrollo local con Bun, respaldado por [backend/bun.lock](backend/bun.lock) y [frontend/bun.lock](frontend/bun.lock)
- Despliegue en Render, documentado en [render.yaml](render.yaml#L1-L20) y ejecutado con Yarn en producción

Esta separación debe reflejarse en todas las guías operativas para evitar mezclar herramientas entre entornos.

# Guía específica del proyecto

## 1) Desarrollo local: usar Bun
Regla:
- Para instalar dependencias localmente: `bun install`
- Para arrancar el backend: `bun run start:dev`
- Para arrancar el frontend: `bun run dev -- --host 0.0.0.0`
- Para compilar: `bun run build`

Ejemplo real:
- [backend/package.json](backend/package.json)
- [frontend/package.json](frontend/package.json)
- [backend/src/main.ts](backend/src/main.ts)
- [frontend/vite.config.ts](frontend/vite.config.ts)

## 2) Deploy / producción: usar Yarn
Regla:
- Las ejecuciones de producción, Render y pipeline de release deben basarse en Yarn.
- Comandos esperados: `yarn install --frozen-lockfile`, `yarn build`, `yarn start`.

Ejemplo real:
- [render.yaml](render.yaml#L1-L20)

## 3) CI/CD y despliegue: mantener el gestor por entorno
Las tareas de CI, release o despliegue deben seguir el gestor definido para ese entorno.

Regla:
- Si se ejecuta en un runner de CI o en Render, usar Yarn.
- Si se ejecuta localmente para desarrollar, usar Bun.
- No mezclar gestores entre etapas ni documentar un comando en el entorno equivocado.

## 4) Mantener ramas por responsabilidad
El proyecto tiene dos dominios claramente separados: frontend y backend. Se observa una estructura monorepo con dos package.json distintos en [frontend/package.json](frontend/package.json) y [backend/package.json](backend/package.json).

Regla:
- Las ramas deben reflejar el alcance del cambio: `feature/auth`, `fix/art-upload`, `docs/verification`, `chore/ci`.
- Evitar cambios mixtos sin describir el dominio afectado.

## 5) Usar PRs para cambios que cambian contratos o infraestructura
Los cambios que tocan [backend/src/main.ts](backend/src/main.ts), [backend/src/sub_services/supabaseClient.ts](backend/src/sub_services/supabaseClient.ts), [frontend/src/App.tsx](frontend/src/App.tsx) o [render.yaml](render.yaml#L1-L20) deben revisarse como cambios de arquitectura o integración.

Regla:
- Todo cambio sobre rutas, variables de entorno, puertos o configuración de despliegue requiere PR con revisión de al menos un responsable.

## 6) Documentar cambios de infraestructura y ejecución
La documentación de ejecución y verificación del proyecto está en [verification.md](verification.md) y la configuración real de despliegue está en [render.yaml](render.yaml#L1-L20).

Regla:
- Cualquier cambio que modifique puertos, servicios, rutas o despliegue debe reflejarse en la documentación y en el PR.

## 7) Comunicar cambios de dominio con mensajes de commit claros
La entrega actual ya muestra commits con mensajes descriptivos, por ejemplo `docs(...)` o `feat(...)`.

Regla:
- Usar mensajes con prefijos semánticos: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Especificar el alcance del cambio y el archivo o dominio principal afectado.

## 8) No mezclar refactors y feature work en la misma rama
El repositorio ya evidenció cambios de documentación y de ingeniería en varias etapas, pero la disciplina del commit debe seguir un patrón limpio.

Regla:
- `feat` para nuevas funcionalidades, `fix` para correcciones, `docs` para documentación, `chore` para configuration/build.
- Evitar mezclar múltiples tipos de cambio en un solo commit cuando el alcance es grande.
