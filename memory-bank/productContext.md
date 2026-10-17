# Product Context

## Visión real del producto
La app es una plataforma web orientada a contenido creativo y comunidad, con enfoque en arte y autenticación de usuarios. La evidencia más directa está en la ruta principal del frontend y en los módulos del backend.

- El landing page define una experiencia de bienvenida con login, registro y acceso a la galería de arte: [frontend/src/components/Home.tsx](../frontend/src/components/Home.tsx)
- La navegación de la SPA incluye `/`, `/Login`, `/Register`, `/Arte`, `/Amigos`, `/Teams` y una ruta protegida para `/Arte/PostearArte`: [frontend/src/App.tsx](../frontend/src/App.tsx)
- El backend expone módulos de dominio para autenticación, arte, música, películas, juegos y ofertas de trabajo: [backend/src/app.module.ts](../backend/src/app.module.ts)

## Funcionalidad comprobada

### 1) Autenticación de usuarios
Se implementa con Supabase Auth y rutas de login, registro y refresh:
- [backend/src/auth/auth.controller.ts](../backend/src/auth/auth.controller.ts)
- [backend/src/auth/auth.service.ts](../backend/src/auth/auth.service.ts)
- [frontend/src/components/auth/Login.tsx](../frontend/src/components/auth/Login.tsx)
- [frontend/src/components/auth/Register.tsx](../frontend/src/components/auth/Register.tsx)

La UI guarda el `access_token` y el usuario en `localStorage` tras iniciar sesión, y la vista principal verifica ese estado para mostrar login/logout: [frontend/src/components/Home.tsx](../frontend/src/components/Home.tsx).

### 2) Galería y publicación de arte
La funcionalidad más completa y verificable es la gestión de arte:
- El controlador expone endpoints para listar, consultar y publicar arte: [backend/src/art/art.controller.ts](../backend/src/art/art.controller.ts)
- El servicio obtiene posts desde Supabase, y sube imágenes y metadata del archivo: [backend/src/art/art.service.ts](../backend/src/art/art.service.ts)
- El almacenamiento se realiza en Supabase Storage utilizando buckets: [backend/src/sub_services/storage.service.ts](../backend/src/sub_services/storage.service.ts)
- La galería del frontend consume `GET /api/Art/ArtPosts` y renderiza publicaciones: [frontend/src/components/App/GaleriaArte-app.tsx](../frontend/src/components/App/GaleriaArte-app.tsx)
- La ruta protegida para publicar arte está en [frontend/src/App.tsx](../frontend/src/App.tsx)

### 3) Comunidad y contenido social
La SPA incluye secciones que sugieren una red social alrededor del contenido creativo:
- `Amigos`: [frontend/src/components/App/Amigos-app.tsx](../frontend/src/components/App/Amigos-app.tsx)
- `Teams`: [frontend/src/components/App/Teams-app.tsx](../frontend/src/components/App/Teams-app.tsx)
- Módulos del backend para `Music`, `Film`, `Game`, `JobOffer`: [backend/src/app.module.ts](../backend/src/app.module.ts)

## Qué no está verificado como producto completo
Aunque la estructura del dominio sugiere un dashboard de creatividad y comunidad, no se verificó una implementación completa y end-to-end para todas las áreas de contenido. La parte mejor respaldada por el código es la autenticación y la gestión de arte.

## Regulación funcional implícita
La app trabaja con:
- sesión de usuario
- contenido multimedia
- almacenamiento en cloud
- rutas protegidas
- consumo de API desde frontend no protegido por una capa de servicio centralizada

Esto es coherente con una plataforma de creación y publicación de contenido social, pero el alcance operativo real en código queda concentrado en autenticación y arte.

## Conclusión
El producto real del repositorio es una app web de creación y comunidad centrada en usuarios, posts de arte, API REST y almacenamiento de contenido en Supabase.
