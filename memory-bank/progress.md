# Progress

## Estado actual del proyecto
El repositorio está en una etapa funcional de prototipo o MVP inicial con evidencias de arquitectura y flujo principales ya implementados.

## Qué funciona de forma verificable

### 1) Backend levantable con NestJS
La API se inicia con el comando real del proyecto:
- [backend/package.json](../backend/package.json)
- [backend/src/main.ts](../backend/src/main.ts)

Evidencia de arranque real:
- `app.setGlobalPrefix('api')`
- `process.env.PORT || 8080`
- Swagger configurado en `/secret`

### 2) Frontend con navegación principal operativa
La SPA tiene rutas y componentes importantes en [frontend/src/App.tsx](../frontend/src/App.tsx):
- `/`
- `/Login`
- `/Register`
- `/Arte`
- `/Arte/:artpost_id`
- `/Amigos`
- `/Teams`

### 3) Autenticación con Supabase implementada
- [backend/src/auth/auth.service.ts](../backend/src/auth/auth.service.ts)
- [backend/src/auth/auth.controller.ts](../backend/src/auth/auth.controller.ts)
- [backend/src/sub_services/supabaseClient.ts](../backend/src/sub_services/supabaseClient.ts)
- [frontend/src/components/auth/Login.tsx](../frontend/src/components/auth/Login.tsx)

Se verifican login, registro, refresh y cierre de sesión dentro del código del proyecto.

### 4) Arte con CRUD básico y subida de archivos
- Listado de posts: [backend/src/art/art.service.ts](../backend/src/art/art.service.ts)
- Endpoints de arte: [backend/src/art/art.controller.ts](../backend/src/art/art.controller.ts)
- Storage de imágenes: [backend/src/sub_services/storage.service.ts](../backend/src/sub_services/storage.service.ts)
- UI de galería: [frontend/src/components/App/GaleriaArte-app.tsx](../frontend/src/components/App/GaleriaArte-app.tsx)

## Deuda técnica identificada

### 1) Inconsistencia de contratos y tipos
- Uso de `any` en servicios y entrada: [backend/src/auth/auth.service.ts](../backend/src/auth/auth.service.ts)
- Hardcoded URLs en frontend: [frontend/src/components/auth/Login.tsx](../frontend/src/components/auth/Login.tsx), [frontend/src/components/App/GaleriaArte-app.tsx](../frontend/src/components/App/GaleriaArte-app.tsx)

### 2) UI acoplada a red y sesión
- `localStorage` usado directamente en la UI: [frontend/src/components/Home.tsx](../frontend/src/components/Home.tsx)
- fetch directo desde componentes y no desde un cliente API centralizado

### 3) Testing insuficiente
- Tests starter no alineados con negocio: [backend/src/app.controller.spec.ts](../backend/src/app.controller.spec.ts), [backend/test/app.e2e-spec.ts](../backend/test/app.e2e-spec.ts)
- No hay suite de tests del frontend en [frontend/package.json](../frontend/package.json)

### 4) Documentación y DX incompletos
- Readmes genericos de starter: [backend/README.md](../backend/README.md), [frontend/README.md](../frontend/README.md)
- Falta de un workflow de arranque unificado para monorepo completo

## Prioridades inmediatas

1. Centralizar la configuración y la baseURL de la API del frontend.
2. Eliminar `any` y plantear DTOs estrictos en backend.
3. Crear un cliente API y mover los fetch desde los componentes.
4. Añadir pruebas mínimas de negocio para auth y arte.
5. Documentar el arranque local real, variables de entorno y endpoints clave.
6. Establecer contratos de respuesta y manejar errores globales del frontend.

## Riesgo de ejecución actual
El proyecto está bien estructurado como prototipo funcional, pero aún no tiene un nivel de madurez suficiente para evolución sin riesgo: la integración entre frontend y backend depende de convenciones implementadas a mano en componentes, y la validación automática actual no cubre las funciones de dominio más importantes.

## Conclusión
El proyecto está en una fase de construcción funcional con un MVP claro de autenticación y publicación de arte, pero necesita reforzar contratos, testing, documentación y centralización de API para sostener crecimiento sin regresiones.
