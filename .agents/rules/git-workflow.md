# Nombre
Git Workflow and Delivery Standards

# Alcance
Aplica a todas las ramas, pull requests, commits y validación del repositorio en desarrollo y despliegue.

# Justificación
El repositorio ya usa CI en [.github/workFlows/ci.yaml](.github/workFlows/ci.yaml) y despliegue en [render.yaml](render.yaml#L1-L20). Sin embargo, no hay una regla explícita de branching ni de revisión que asegure consistencia y trazabilidad entre frontend, backend y documentación.

# Guía específica del proyecto

## 1) Mantener ramas por responsabilidad
El proyecto tiene dos dominios claramente separados: frontend y backend. Se observa una estructura monorepo con dos `package.json` distintos en [frontend/package.json](frontend/package.json) y [backend/package.json](backend/package.json).

Regla:
- Las ramas deben reflejar el alcance del cambio: `feature/auth`, `fix/art-upload`, `docs/verification`, `chore/ci`.
- Evitar cambios mixtos sin describir el dominio afectado.

## 2) Usar PRs para cambios que cambian contratos o infraestructura
Los cambios que tocan [backend/src/main.ts](backend/src/main.ts), [backend/src/sub_services/supabaseClient.ts](backend/src/sub_services/supabaseClient.ts), [frontend/src/App.tsx](frontend/src/App.tsx) o [render.yaml](render.yaml#L1-L20) deben revisarse como cambios de arquitectura o integración.

Regla:
- Todo cambio sobre rutas, variables de entorno, puertos o configuración de despliegue requiere PR con revisión de al menos un responsable.

## 3) Respetar la validación automática de CI
La CI actual del repo se define en [.github/workFlows/ci.yaml](.github/workFlows/ci.yaml) y ejecuta:
- `npm ci`
- `npm run lint`
- `npm run build`

Regla:
- Nadie debe fusionar código que no pase la validación de lint y build.
- Si un cambio afecta backend y frontend, debe ejecutarse la verificación de ambos servicios.

## 4) Documentar cambios de infraestructura y ejecución
La documentación de ejecución y verificación del proyecto está en [verification.md](verification.md) y la configuración real de despliegue está en [render.yaml](render.yaml#L1-L20).

Regla:
- Cualquier cambio que modifique puertos, servicios, rutas o despliegue debe reflejarse en la documentación y en el PR.

## 5) Comunicar cambios de dominio con mensajes de commit claros
La entrega actual ya muestra commits con mensajes descriptivos, por ejemplo en el contexto del entorno de trabajo (`git commit -m "docs(phase-1)..."`).

Regla:
- Usar mensajes con prefijos semánticos: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Especificar el alcance del cambio y el archivo o dominio principal afectado.

## 6) No mezclar refactors y feature work en la misma rama
El repositorio ya evidenció cambios de documentación y de ingeniería en varias etapas, pero la disciplina del commit debe seguir un patrón limpio.

Regla:
- `feat` para nuevas funcionalidades, `fix` para correcciones, `docs` para documentación, `chore` para configuration/build.
- Evitar mezclar múltiples tipos de cambio en un solo commit cuando el alcance es grande.
