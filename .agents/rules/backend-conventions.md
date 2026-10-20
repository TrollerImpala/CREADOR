# Nombre
Backend Conventions

# Alcance
Aplica a todos los servicios, controladores, DTOs, servicios y utilidades del backend en [backend/src](backend/src), incluyendo autenticación, arte, música, películas, juegos, ofertas y storage.

# Justificación
El repositorio ya demuestra una separación clara entre controladores y servicios, por ejemplo en [backend/src/art/art.controller.ts](backend/src/art/art.controller.ts) y [backend/src/art/art.service.ts](backend/src/art/art.service.ts), pero también muestra un patrón inconsistente de `any`, validación mínima y acceso directo a Supabase. Esta regla busca sostener la base NestJS y evitar que la lógica del negocio se disperse en controladores o capas de infraestructura.

# Guía específica del proyecto

## 1) Mantener la responsabilidad por capa
- Los controladores solo deben transformar HTTP en llamadas a servicios.
- Dichos servicios deben encapsular lógica de dominio y acceso a datos.
- La infraestructura de datos y almacenamiento debe quedar en servicios auxiliares, como [backend/src/sub_services/storage.service.ts](backend/src/sub_services/storage.service.ts) y [backend/src/sub_services/supabaseClient.ts](backend/src/sub_services/supabaseClient.ts).

Ejemplo real:
- [backend/src/art/art.controller.ts](backend/src/art/art.controller.ts) recibe el request y delega a `this.artService.postArt(...)`.
- [backend/src/art/art.service.ts](backend/src/art/art.service.ts) realiza la lógica real de carga de archivo, inserción y manejo de errores.

Regla:
- Si una función hace más de una cosa (validar, guardar archivo, persistir, transformar respuesta), dividirla en servicios o helpers.

## 2) Evitar `any` en contratos públicos
El proyecto tiene casos como `register(body: any)` y `login(body: any)` en [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts), y `postArt(user_id: string, body: any)` en [backend/src/art/art.service.ts](backend/src/art/art.service.ts).

Regla:
- Cada endpoint debe tener un DTO específico o al menos una interfaz con campos explícitos.
- Preferir `CreateArtPostDto` de [backend/src/DTO/art.dto.ts](backend/src/DTO/art.dto.ts) y extender ese patrón a las demás entidades.

## 3) Usar validación explícita y no depender sólo del runtime
El bootstrap del backend habilita `ValidationPipe` en [backend/src/main.ts](backend/src/main.ts), pero muchas rutas aún aceptan payloads sin tipo fuerte.

Regla:
- Activar `whitelist` y `forbidNonWhitelisted` como estándar.
- Rechazar payloads inesperados en todos los endpoints nuevos.

## 4) Centralizar manejo de errores
Hay varios ejemplos de `throw new BadRequestException` y `UnauthorizedException` en [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts) y [backend/src/art/art.service.ts](backend/src/art/art.service.ts), pero también hay `console.log` y errores sin contexto en [backend/src/art/art.controller.ts](backend/src/art/art.controller.ts) y [backend/src/art/art.service.ts](backend/src/art/art.service.ts).

Regla:
- No hacer `console.log` de datos sensibles o de negocio en producción.
- Para errores de dominio, usar excepciones tipadas y mensajes consistentes.

## 5) Mantener modelos de datos y nombres de entidades coherentes
La app tiene recursos de dominio como `Art`, `Auth`, `Music`, `Film`, `Game`, `JobOffer` en [backend/src/app.module.ts](backend/src/app.module.ts) y [backend/src](backend/src).

Regla:
- Las rutas y nombres deben seguir un patrón uniforme: `GET /art`, `POST /art`, `GET /art/:id`, no verbos como `PostArt` o `ArtPosts` si ya existe una estructura REST clara.

## 6) Separar configuración y secretos
La configuración de Supabase se lee desde variables de entorno en [backend/src/sub_services/supabaseClient.ts](backend/src/sub_services/supabaseClient.ts) y [backend/.env](backend/.env).

Regla:
- Todo valor sensible debe vivir en variables de entorno y no mezclarse en código fuente.
- Los servicios no deben instanciar clientes Supabase con cadenas hardcodeadas.

## 7) Exigir pruebas del dominio real
El default Nest starter se ve en [backend/src/app.controller.spec.ts](backend/src/app.controller.spec.ts), pero no prueba la funcionalidad de la app de verdad.

Regla:
- Cada cambio de endpoint de autenticación, arte o storage requiere prueba de integración o unit test.
- No aceptar cambios sin pruebas con al menos un caso feliz y uno de error.
