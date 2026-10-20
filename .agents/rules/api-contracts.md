# Nombre
API Contracts and Integration Rules

# Alcance
Aplica a la integración entre frontend y backend, incluyendo rutas, payloads, respuestas y documentación OpenAPI del backend.

# Justificación
La app presenta una API con prefijo `/api` en [backend/src/main.ts](backend/src/main.ts), y el frontend la consume con URLs directas y con suposiciones sobre el payload. Eso genera acoplamiento fuerte y riesgo de rotura cuando el backend cambia. El proyecto ya instala Swagger en [backend/src/main.ts](backend/src/main.ts), lo que debe aprovecharse para formalizar contratos.

# Guía específica del proyecto

## 1) Definir un contrato claro entre frontend y backend
El backend expone rutas como:
- `POST /api/Auth/Login` en [backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts)
- `GET /api/Art/ArtPosts` en [backend/src/art/art.controller.ts](backend/src/art/art.controller.ts)
- `POST /api/Art/PostArt` en [backend/src/art/art.controller.ts](backend/src/art/art.controller.ts)

El frontend usa rutas equivalentes en:
- [frontend/src/components/auth/Login.tsx](frontend/src/components/auth/Login.tsx)
- [frontend/src/components/App/GaleriaArte-app.tsx](frontend/src/components/App/GaleriaArte-app.tsx)

Regla:
- Todo endpoint nuevo debe estar documentado en Swagger y debe ser consumido desde un único cliente HTTP del frontend.

## 2) Usar DTOs y tipos de salida explícitos
Los endpoints de Art tienen `CreateArtPostDto` en [backend/src/DTO/art.dto.ts](backend/src/DTO/art.dto.ts), pero la app usa `any` en muchos servicios y payloads; ejemplo en [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts).

Regla:
- Definir interfaces TypeScript para entrada/salida del backend y frontend con el mismo nombre de dominio.
- No depender de estructuras dinámicas para datos críticos.

## 3) Normalizar nombres de rutas y respuestas
El proyecto mezcla respuestas con claves como `art`, `mensaje`, `user`, `user_token`, `refresh_token`, y recursos como `ArtPosts`, `ArtPost`, `Auth` en [backend/src/art/art.controller.ts](backend/src/art/art.controller.ts) y [backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts).

Regla:
- Adoptar un contrato de respuesta consistente: `{ data, message, error? }` o equivalente.
- No mezclar verbos en la URL ni sinónimos del dominio en distintos endpoints.

## 4) Proteger la integración con manejo centralizado de errores HTTP
La UI hace `errorMsg(response, eMsg)` en [frontend/src/components/hooks/useForm.tsx](frontend/src/components/hooks/useForm.tsx) y el backend lanza excepciones específicas en [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts).

Regla:
- Cada response no exitoso debe mapearse a un código y un mensaje de negocio, no a un texto genérico del navegador.
- El frontend debe implementar un manejo global de 401/403/500.

## 5) Aprovechar Swagger como fuente de verdad
El bootstrap crea Swagger en `/secret` en [backend/src/main.ts](backend/src/main.ts).

Regla:
- Todo cambio de endpoint debe reflejarse en los decoradores `@ApiTags`, `@ApiOperation`, `@ApiResponse` y en la documentación Swagger.
- El frontend no debe inventar rutas ni payloads que no estén declarados en Swagger.
