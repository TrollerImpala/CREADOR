# Nombre
Testing Quality Standards

# Alcance
Aplica a backend, frontend y validación de integración del proyecto completo.

# Justificación
El repositorio incluye tests starter de Nest en [backend/src/app.controller.spec.ts](backend/src/app.controller.spec.ts) y [backend/test/app.e2e-spec.ts](backend/test/app.e2e-spec.ts), pero no validan la funcionalidad real de la app. Esto deja huecos de regresión muy altos para autenticación, arte, storage y flujo de sesión.

# Guía específica del proyecto

## 1) Deben existir pruebas para caminos críticos
Los módulos críticos son:
- autenticación: [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts)
- arte: [backend/src/art/art.service.ts](backend/src/art/art.service.ts)
- storage: [backend/src/sub_services/storage.service.ts](backend/src/sub_services/storage.service.ts)
- rutas protegidas del frontend: [frontend/src/App.tsx](frontend/src/App.tsx)

Regla:
- Cada módulo de negocio debe tener al menos:
  - caso feliz
  - caso de error
  - caso de validación de entrada

## 2) Reemplazar los tests de plantilla por pruebas de negocio
El test actual valida que `AppController.getHello()` devuelve “Hello World!” en [backend/src/app.controller.spec.ts](backend/src/app.controller.spec.ts). Eso no representa la app real.

Regla:
- Los tests deben cubrir la lógica del negocio y la integración con Supabase, no el boilerplate del framework.

## 3) Agregar pruebas del frontend con comportamiento real
La app React usa rutas, localStorage y fetch, pero no hay una suite de UI test en [frontend/package.json](frontend/package.json).

Regla:
- Añadir test de render para `Login`, `Home`, rutas protegidas y galería con datos mockeados minimamente.
- No hacer pruebas sólo sobre la presencia de elementos mockeados; probar el comportamiento observable.

## 4) Probar la resiliencia ante errores de red y sesión
Hay varios flujos de fetch con `errorMsg(response, eMsg)` y `localStorage` en [frontend/src/components/hooks/useForm.tsx](frontend/src/components/hooks/useForm.tsx) y [frontend/src/components/Home.tsx](frontend/src/components/Home.tsx).

Regla:
- Cada formulario o acceso a API debe tener tests que cubran 401, 403, 500 y pérdida de conexión.
- Las pruebas no deben asumir que el backend siempre responde bien.

## 5) Hacer smoke tests para backend y frontend juntos
La ejecución real de front y back está descrita en [render.yaml](render.yaml#L1-L20) y [backend/src/main.ts](backend/src/main.ts), pero no hay una prueba de arranque del sistema completo.

Regla:
- Debe existir un smoke test de integración que arranque ambos stacks y consulte un endpoint crítico.
- La validación de la app debe ocurrir en ejecución real, no solo por compilación.
