# Hallazgos de Arquitectura, Convenciones y Riesgos

## Arquitectura

### 1) La capa de presentación mezcla responsabilidades de UI, navegación y acceso a datos

- Evidencia: la SPA define rutas en [frontend/src/App.tsx](frontend/src/App.tsx#L1-L62), y además hace llamadas HTTP directamente desde componentes como [frontend/src/components/auth/Login.tsx](frontend/src/components/auth/Login.tsx#L18-L48), [frontend/src/components/App/GaleriaArte-app.tsx](frontend/src/components/App/GaleriaArte-app.tsx#L12-L42) y [frontend/src/components/tools/logout.tsx](frontend/src/components/tools/logout.tsx).
- Riesgo: la lógica de autenticación, la obtención de datos y la gestión del estado de sesión están repartidas entre componentes y utilidades. Esto hace más difícil reutilizar, testear y auditar el comportamiento y aumenta el acoplamiento visual-UI con la capa de red.
- Regla accionable: mover la comunicación a un cliente HTTP centralizado (`apiClient` o `services/*`) y dejar a los componentes solo la presentación y el control de eventos.

### 2) El backend sí separa servicios, pero la frontera “controlador vs negocio vs infraestructura” no está aplicada de forma consistente

- Evidencia: los controladores están en [backend/src/art/art.controller.ts](backend/src/art/art.controller.ts#L1-L78), la lógica de negocio en [backend/src/art/art.service.ts](backend/src/art/art.service.ts#L1-L98) y la infraestructura de almacenamiento en [backend/src/sub_services/storage.service.ts](backend/src/sub_services/storage.service.ts#L1-L41).
- Riesgo: aun así, varios métodos aceptan `body: any` o `any` para uploads y autenticación, por ejemplo en [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts#L17-L46) y [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts#L47-L92). Eso concentra validación y contratos en runtime, no en tipos ni DTOs.
- Regla accionable: cada endpoint debe tener un DTO explícito y un servicio con firma tipada; evitar `any` en contratos HTTP y mantener un único tipo de respuesta por dominio.

### 3) Hay una dependencia implícita entre frontend y backend que no está codificada en un contrato compartido

- Evidencia: la ruta base del backend se escribe varias veces como `http://localhost:8080/api/...` en componentes de frontend; por ejemplo en [frontend/src/components/auth/Login.tsx](frontend/src/components/auth/Login.tsx#L18-L48), [frontend/src/components/auth/Register.tsx](frontend/src/components/auth/Register.tsx) y [frontend/src/components/App/GaleriaArte-app.tsx](frontend/src/components/App/GaleriaArte-app.tsx#L12-L42). El backend define `PORT=8080` en [backend/.env](backend/.env#L1-L4) y `app.setGlobalPrefix('api')` en [backend/src/main.ts](backend/src/main.ts#L10-L18).
- Riesgo: si el puerto o el dominio cambian, la app rompe por hardcode y no hay un origen único de verdad para la API.
- Regla accionable: centralizar la baseUrl en una variable de entorno de frontend (`VITE_API_BASE_URL`) y documentar el contrato de endpoints con un contrato o OpenAPI consumible.

### 4) La app no tiene una capa de orchestration ni un punto de entrada unificado para levantar servicios en entorno local

- Evidencia: no hay `docker-compose.yml`, `Dockerfile` o un manifiesto raíz de orquestación; la ejecución está dividida entre [frontend/package.json](frontend/package.json#L1-L34), [backend/package.json](backend/package.json#L1-L77) y [render.yaml](render.yaml#L1-L20).
- Riesgo: el onboarding es frágil; cada desarrollador debe recordar dos procesos distintos, con distintos comandos y variables de entorno.
- Regla accionable: añadir scripts root del workspace para desarrollo y build, usando la herramienta del entorno correcto, y un archivo de entorno base para un flujo único de arranque.

---

## Naming

### 1) Hay inconsistencia de estilo entre nombres de archivos, rutas y entidades

- Evidencia: el proyecto mezcla nombres con camelCase, kebab-case, mayúsculas y español/inglés, por ejemplo en [backend/src/jobOffers/job-offer.service.ts](backend/src/jobOffers/job-offer.service.ts), [backend/src/art/art.controller.ts](backend/src/art/art.controller.ts), [frontend/src/components/App/Posts/Postear-Arte.tsx](frontend/src/components/App/Posts/Postear-Arte.tsx), [frontend/src/App.tsx](frontend/src/App.tsx#L8-L62) y [backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts).
- Riesgo: aumenta la carga cognitiva, dificulta búsqueda y provoca errores de importación y referencias simbólicas.
- Regla accionable: elegir y aplicar un único estándar: kebab-case para archivos, PascalCase para componentes y camelCase para variables; evitar mezclar idiomas en nombres de rutas y módulos.

### 2) El dominio usa un vocabulario híbrido que no expresa claramente el mismo modelo de negocio

- Evidencia: aparecen tanto `ArtPost`, `JobOffer`, `Music`, `Film`, `Game`, `Auth`, `GeneralPosts`, `Teams`, `Amigos`, `PostearArte`, etc. en rutas y archivos; por ejemplo en [backend/src/app.module.ts](backend/src/app.module.ts#L1-L55) y [frontend/src/App.tsx](frontend/src/App.tsx#L8-L62).
- Riesgo: el modelo de negocio no está unificado, y la evolución del producto necesitará un mapeo manual entre conceptos del dominio.
- Regla accionable: definir un glossary del dominio y usarlo en entidades, rutas y tablas; por ejemplo, decidir si se usa “art-post”, “post”, “content” o “creation” en todo el repo.

### 3) El naming en endpoints no sigue un patrón uniforme

- Evidencia: el backend define controladores con nombres de recursos y rutas como `@Controller('Art')`, `@Controller('Auth')`, y luego usa métodos como `ArtPosts`, `ArtPost/:id`, `PostArt`, `Register`, `Login`, `Refresh`, `LogOut` en [backend/src/art/art.controller.ts](backend/src/art/art.controller.ts#L1-L78) y [backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts#L1-L24).
- Riesgo: se mezclan acciones y recursos y el estilo REST no es consistente. Esto complica el consumo de la API y la integración con clientes.
- Regla accionable: establecer una convención de rutas REST: `GET /art`, `POST /art`, `GET /art/:id` y eventos de sesión como `/auth/login`, `/auth/logout` y evitar verbos en la URL.

---

## Error Handling

### 1) Se captura el error generando mensajes genéricos y se pierde trazabilidad real

- Evidencia: tanto en frontend como backend hay `catch` amplios con `console.error` o `throw new Error` sin contexto de dominio. Ejemplos: [frontend/src/components/hooks/useForm.tsx](frontend/src/components/hooks/useForm.tsx#L45-L73), [frontend/src/components/App/GaleriaArte-app.tsx](frontend/src/components/App/GaleriaArte-app.tsx#L15-L31) y [backend/src/art/art.service.ts](backend/src/art/art.service.ts#L70-L109).
- Riesgo: los errores no se registran con metadata útil; el usuario recibe un mensaje pobre, y la causa raíz se pierde en logs de consola.
- Regla accionable: centralizar errores con un logger estructurado y errores específicos del dominio (`ValidationError`, `AuthError`, `StorageError`), con mensajes de usuario separados de los mensajes técnicos.

### 2) El backend usa `any` en contratos de entrada y la validación global no está aplicada uniformemente

- Evidencia: `AuthService.register(body: any)` y `login(body: any)` en [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts#L17-L46), `createArtPost(@Body() body: CreateArtPostDto)` en [backend/src/art/art.controller.ts](backend/src/art/art.controller.ts#L39-L78), pero el servicio acepta `body: any` y la validación del `ValidationPipe` se activa con `whitelist: true` en [backend/src/main.ts](backend/src/main.ts#L7-L18).
- Riesgo: se depende de la validación manual y del runtime. El sistema puede aceptar datos no esperados y la superficie de fallo crece.
- Regla accionable: usar DTOs para cada entrada, `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` y transformaciones explícitas del payload; prohibir `any` en endpoints públicos.

### 3) Hay varias comprobaciones de sesión basadas en `localStorage` sin un mecanismo unificado de token refresh o expiración

- Evidencia: la UI evalúa `localStorage.getItem('access_token')` en [frontend/src/components/Home.tsx](frontend/src/components/Home.tsx#L29-L57), y existe refresh token en [frontend/src/components/tools/refresh_token.tsx](frontend/src/components/tools/refresh_token.tsx) y logout en [frontend/src/components/tools/logout.tsx](frontend/src/components/tools/logout.tsx).
- Riesgo: la sesión depende del navegador y del almacenamiento local, sin una capa centralizada ni estrategia clara de renovación o invalidación.
- Regla accionable: encapsular la sesión en un hook/service con estado seguro, refresh automático y manejo de 401/403 centralizado en la aplicación.

---

## Testing

### 1) La base de pruebas es un scaffold por defecto, no una batería alineada con la funcionalidad del proyecto

- Evidencia: los tests de backend en [backend/src/app.controller.spec.ts](backend/src/app.controller.spec.ts#L1-L20) y [backend/test/app.e2e-spec.ts](backend/test/app.e2e-spec.ts#L1-L27) validan el endpoint raíz por defecto de NestJS (`Hello World!`), no el dominio real del sistema.
- Riesgo: la suite no prueba autenticación, arte, almacenamiento ni flujos de negocio esperados por la app; puede pasar aunque la funcionalidad real falle.
- Regla accionable: reemplazar los tests starter por pruebas de dominio: auth/login, register, `GET /art`, `POST /art` y manejo de errores de Supabase.

### 2) El frontend no tiene estrategia de tests automatizados, solo lint y build

- Evidencia: [frontend/package.json](frontend/package.json#L1-L34) define `dev`, `build`, `lint` y `preview`, pero no `test` ni `vitest`/`jest`.
- Riesgo: no hay protección contra regresiones en componentes, render y flujos de auth.
- Regla accionable: añadir una suite mínima con Vitest + Testing Library para componentes clave: Login, Galería, rutas protegidas y manejo de sesión.

### 3) El repo no verifica el comportamiento real del backend con un servidor arrancado ni con integración mínima

- Evidencia: la configuración de despliegue está bien definida en [render.yaml](render.yaml#L1-L20), pero no hay documentación ni script de validación local para arrancar ambos servicios juntos y comprobar rutas reales.
- Riesgo: la integración front-back se valida sólo por lectura del código, no por ejecución.
- Regla accionable: añadir un comando de integración local del entorno correcto y un smoke test HTTP para endpoints clave.

---

## DX (Developer Experience)

### 1) La configuración de entorno está duplicada y no está versionada de forma consistente

- Evidencia: hay un `.env` en [backend/.env](backend/.env#L1-L4) y otro en [frontend/.env](frontend/.env#L1-L2), además del uso de `ConfigModule.forRoot(...)` en [backend/src/app.module.ts](backend/src/app.module.ts#L1-L55).
- Riesgo: no hay plantilla clara para nuevos desarrolladores y existe riesgo de filtrar secretos o desincronizar valores entre frontend y backend.
- Regla accionable: crear `.env.example` para cada servicio, documentar variables obligatorias y añadir `.gitignore`/escaneo de secretos si no lo hay ya.

### 2) Los README son plantillas genéricas del starter, no del proyecto real

- Evidencia: [backend/README.md](backend/README.md) y [frontend/README.md](frontend/README.md) siguen el boilerplate de NestJS y Vite, sin describir la app CREADOR ni sus comandos reales.
- Riesgo: onboarding y troubleshooting quedan incompletos; un desarrollador nuevo no sabe ni qué hace esta app ni cómo levantarla en su entorno.
- Regla accionable: reemplazar los README generados por documentación real del proyecto: stack, flujo de arranque, variables de entorno, rutas relevantes y procesos de despliegue.

### 3) El repo no tiene un nivel raíz de coordinación para un monorepo de frontend y backend

- Evidencia: hay dos `package.json` independientes en [backend/package.json](backend/package.json#L1-L77) y [frontend/package.json](frontend/package.json#L1-L34), pero no existe un `package.json` raíz ni scripts de workspace.
- Riesgo: cada servicio se entiende por separado, pero no hay una operación única para instalar, levantar, probar y validar la solución completa.
- Regla accionable: añadir un workspace raíz con scripts orientados a developer workflow: install, build, lint, test, dev y smoke checks.

---

## Conclusión

El repositorio tiene una base clara de frontend React/Vite y backend NestJS con Supabase, pero la calidad del código se ve limitada por contratos implícitos, naming inconsistente, validación débil, tests starter y ausencia de DX centralizada. El mayor riesgo inmediato no es la arquitectura general, sino la falta de una capa bien definida de API, seguridad y pruebas que respalde el crecimiento del producto.
