# CREADOR

Plataforma web multidisciplinaria para creadores independientes. CREADOR busca centralizar portfolios, publicaciones y oportunidades de colaboración para facilitar el descubrimiento de talentos y la formación de equipos entre distintas disciplinas.

> **Estado de esta documentación:** basada en el código de la rama `main` del repositorio y contrastada con el documento funcional/técnico del proyecto. Los endpoints de publicaciones de películas y videojuegos se excluyen deliberadamente.
## Contenido

- [Objetivo](#objetivo)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura y comunicación](#arquitectura-y-comunicación)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Configuración y ejecución local](#configuración-y-ejecución-local)
- [Variables de entorno](#variables-de-entorno)
- [API REST](#api-rest)
- [Autenticación y archivos](#autenticación-y-archivos)
- [Despliegue y CI/CD](#despliegue-y-cicd)
- [Consideraciones técnicas](#consideraciones-técnicas)

## Objetivo

CREADOR está pensado para artistas, músicos, fotógrafos, filmmakers, desarrolladores, empresas, emprendedores y usuarios que quieran compartir trabajos o participar en proyectos.

La plataforma aborda tres problemas:

1. **Fragmentación de plataformas:** permite reunir trabajos de distintas disciplinas en un mismo perfil.
2. **Aislamiento entre disciplinas:** facilita que creadores de áreas diferentes puedan descubrirse.
3. **Dificultad para colaborar:** incorpora publicaciones y ofertas de proyectos para facilitar el contacto y el reclutamiento.

Entre las funcionalidades contempladas se encuentran perfiles, portfolios, publicaciones artísticas y musicales, ofertas de proyectos, autenticación y navegación por galerías.

## Stack tecnológico

| Tecnología | Uso en el proyecto |
|---|---|
| **Node.js** | Runtime de JavaScript sobre el que se ejecuta el backend NestJS y las herramientas del ecosistema. |
| **TypeScript** | Lenguaje utilizado en frontend y backend; agrega tipado estático a JavaScript. |
| **React 19** | Biblioteca de interfaz del frontend, basada en componentes. |
| **Vite 8** | Servidor de desarrollo y herramienta de build del frontend. |
| **React Router 7** | Enrutamiento de páginas del frontend. |
| **NestJS 11** | Framework del backend; organiza la API mediante módulos, controladores y servicios. |
| **Express / Platform Express** | Adaptador HTTP utilizado por NestJS y soporte para recibir archivos mediante Multer. |
| **Supabase** | Backend-as-a-Service utilizado para autenticación, persistencia y almacenamiento. |
| **PostgreSQL** | Motor relacional proporcionado por Supabase. |
| **Supabase JavaScript SDK (`@supabase/supabase-js`)** | Cliente utilizado por el backend para comunicarse con Auth, tablas y Storage de Supabase. También figura como dependencia del frontend. |
| **class-validator / class-transformer** | Dependencias para validación y transformación de datos; el backend activa un `ValidationPipe` global. |
| **Swagger (`@nestjs/swagger`)** | Generación y exposición de documentación OpenAPI para la API. |
| **Jest / Supertest** | Dependencias configuradas para pruebas unitarias y end-to-end en backend. |
| **Render** | Plataforma declarada en `render.yaml` para desplegar frontend estático y backend Node. |
| **GitHub Actions** | Existe un workflow YAML de CI en `.github/workFlows/ci.yaml`. |

### Decisiones de arquitectura

- **React:** elegido por su ecosistema, documentación, arquitectura basada en componentes y rapidez para construir el MVP.
- **NestJS:** elegido por su arquitectura modular, integración con TypeScript e inyección de dependencias.
- **Supabase/PostgreSQL:** elegido por combinar base relacional, autenticación, Storage y políticas Row Level Security.
- **TypeScript:** unifica el lenguaje del frontend y backend y permite detectar errores de tipos antes de ejecutar.
- **Render:** declarado como destino de despliegue para ambos servicios.

## Arquitectura y comunicación

La aplicación se divide en dos procesos:

- **Frontend:** SPA (Single Page Application) construida con React y Vite. Se encarga de la interfaz, navegación, formularios y consumo de la API.
- **Backend:** API REST construida con NestJS. Recibe las peticiones HTTP, valida/transforma datos, aplica guards cuando corresponde y delega la lógica en servicios.
- **Supabase:** servicio externo al que el backend se conecta mediante `@supabase/supabase-js`. Se utiliza Supabase Auth para las credenciales/sesiones, consultas a tablas y Supabase Storage para archivos.

### Flujo general de una petición

1. El usuario interactúa con un componente React.
2. El frontend realiza una petición HTTP usando `fetch` y la URL base definida por `VITE_API_URL`.
3. NestJS recibe la petición bajo el prefijo global `/api`.
4. El controlador identifica la ruta y extrae parámetros, body, archivos o datos de la petición.
5. Cuando el endpoint está protegido, `SupabaseAuthGuard` valida el token y deja disponible el usuario autenticado en `req.user`.
6. El controlador delega el trabajo en un servicio.
7. El servicio utiliza `SupabaseService` y el SDK de Supabase para operar sobre Auth, tablas o Storage.
8. El backend devuelve una respuesta HTTP, normalmente JSON, que el frontend procesa.

### Formatos de comunicación

- **JSON:** para operaciones como login, registro, refresh y creación de ofertas.
- **`multipart/form-data`:** para operaciones que reciben archivos, como publicaciones de arte/música y actualización del avatar.
- **Bearer token:** el frontend almacena `access_token` y `refresh_token` en `localStorage`. Los endpoints protegidos deben recibir el access token como `Authorization: Bearer <token>`.

> La URL base `VITE_API_URL` debe incluir el prefijo `/api`, porque NestJS lo configura globalmente en `main.ts`. Ejemplo local: `http://localhost:8080/api`.

## Estructura del repositorio

```text
CREADOR/
├── .agents/
│   └── rules/                 # Convenciones y reglas del proyecto
├── .github/
│   └── workFlows/
│       └── ci.yaml            # Workflow de integración continua
├── backend/
│   ├── src/
│   │   ├── DTO/               # Data Transfer Objects
│   │   ├── art/               # Controlador y servicio de arte
│   │   ├── auth/              # Registro, login y refresh
│   │   ├── users/             # Perfil y actualización de usuario
│   │   ├── music/             # Publicaciones musicales
│   │   ├── jobOffers/         # Ofertas de proyectos
│   │   ├── films/             # Módulo de películas
│   │   ├── games/             # Módulo de videojuegos
│   │   ├── guards/            # Guards de autenticación y roles
│   │   ├── decorators/        # Decoradores propios
│   │   ├── enum/              # Enumeraciones
│   │   ├── sub_services/      # Supabase, Storage y servicios comunes
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── bun.lock
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes, páginas, hooks y formularios
│   │   ├── styles/            # Hojas de estilo
│   │   ├── App.tsx            # Configuración de rutas
│   │   └── main.tsx           # Punto de entrada React
│   ├── package.json
│   └── vite.config.ts
├── memory-bank/               # Contexto y documentación técnica interna
├── render.yaml                # Declaración de servicios de Render
└── verification.md            # Verificaciones/documentación del repositorio
```

Los módulos `films` y `games` aparecen en el código y están registrados en el módulo principal, pero sus endpoints se omiten de esta documentación según el alcance solicitado.

## Configuración y ejecución local

### Requisitos

- Node.js compatible con las dependencias del proyecto.
- Bun, utilizado por los README específicos para el desarrollo local y respaldado por `bun.lock`.
- Proyecto de Supabase con las credenciales correspondientes.
- Git.

### Backend

```bash
cd backend
bun install
```

Crear `backend/.env` con las variables indicadas en la sección [Variables de entorno](#variables-de-entorno).

Iniciar en desarrollo:

```bash
bun run start:dev
```

Scripts disponibles en `backend/package.json`:

```bash
npm run start:dev  # NestJS en modo watch
npm run build      # Compila el backend
npm run start      # Inicia NestJS
npm run start:prod # Ejecuta node dist/main
npm run test       # Jest
npm run test:e2e   # Pruebas end-to-end
```

También se documenta Bun como gestor local. Los comandos `npm run` anteriores son equivalentes si las dependencias están instaladas con npm; el README original del backend recomienda `bun run`.

### Frontend

```bash
cd frontend
bun install
```

Crear `frontend/.env` con la URL de la API:

```env
VITE_API_URL=http://localhost:8080/api
```

Iniciar Vite:

```bash
bun run dev
```

Build de producción:

```bash
bun run build
```

El frontend se ejecuta como SPA y consume la API NestJS. La configuración de rutas está en `frontend/src/App.tsx`.

## Variables de entorno

### Backend — `backend/.env.example`

```env
# Puerto HTTP del servidor NestJS
PORT=8080

# Proyecto Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<supabase-anon-key>
```

| Variable | Función |
|---|---|
| `PORT` | Puerto en el que NestJS escucha. Si no está definida, `main.ts` utiliza `8080`. |
| `SUPABASE_URL` | URL del proyecto Supabase. |
| `SUPABASE_ANON_KEY` | Clave pública/anon del proyecto, utilizada por `createClient` en `SupabaseService`. |

`ConfigModule.forRoot()` carga el archivo `.env` desde el directorio de trabajo (`process.cwd()`). En ejecución local, iniciar el backend desde `backend/` permite que encuentre `backend/.env`.

### Frontend — `frontend/.env.example`

```env
# URL base de la API NestJS; debe incluir el prefijo global /api
VITE_API_URL=http://localhost:8080/api
```

| Variable | Función |
|---|---|
| `VITE_API_URL` | URL base usada por el frontend para construir las peticiones HTTP al backend. |

**Importante sobre Vite:** las variables expuestas al código del navegador deben llevar el prefijo `VITE_`. No se deben colocar secretos privados en variables `VITE_*`, porque quedan incorporadas al bundle del frontend.

**Importante sobre Supabase:** el backend actual utiliza `SUPABASE_ANON_KEY`, no una `service_role` key. La clave `anon` no reemplaza la necesidad de configurar correctamente las políticas RLS de Supabase. Nunca publicar una clave `service_role` en el frontend ni en el repositorio.

## API REST

### Configuración general

- **Prefijo global:** `/api`
- **Puerto local por defecto:** `8080`
- **Documentación Swagger:** `/secret`
- **CORS:** habilitado mediante `app.enableCors()`.
- **Validación global:** `ValidationPipe` con `transform: true` y `whitelist: true`.
- **Autenticación:** Supabase Auth y `SupabaseAuthGuard` en las rutas protegidas.

Por lo tanto, si el servidor corre localmente en el puerto por defecto, la base de la API es:

```text
http://localhost:8080/api
```

### Autenticación

| Método | Endpoint | Descripción | Protección |
|---|---|---|---|
| `POST` | `/Auth/Register` | Registra una cuenta mediante Supabase Auth. | Pública |
| `POST` | `/Auth/Login` | Inicia sesión con email y contraseña; devuelve tokens y datos básicos del perfil. | Pública |
| `POST` | `/Auth/Refresh` | Renueva la sesión a partir de un `refresh_token`. | Pública |
| `GET` | `/Auth/LogOut` | Ejecuta el cierre de sesión en Supabase Auth. | Sin guard declarado en el controller |

**Cuerpo orientativo de registro:**

```json
{
  "email": "usuario@example.com",
  "password": "una-clave-segura",
  "userTag": "usuario",
  "userName": "Nombre de usuario",
  "userDescription": "Descripción breve",
  "socialMedias": []
}
```

**Cuerpo de login:**

```json
{
  "email": "usuario@example.com",
  "password": "una-clave-segura"
}
```

**Cuerpo de refresh:**

```json
{
  "refresh_token": "<refresh-token>"
}
```

### Usuarios y perfiles

| Método | Endpoint | Descripción | Protección |
|---|---|---|---|
| `POST` | `/Users/Perfil` | Obtiene el perfil correspondiente al usuario autenticado. | `SupabaseAuthGuard` |
| `PUT` | `/Users/ActualizarPerfil` | Actualiza tag, nombre, descripción, redes sociales y avatar. | `SupabaseAuthGuard` |

La actualización de perfil recibe `multipart/form-data` cuando se envía el archivo `profile_img`. Los campos de texto se procesan mediante `UserDto`.

### Publicaciones de arte

| Método | Endpoint | Descripción | Protección |
|---|---|---|---|
| `GET` | `/Art/ArtPosts` | Obtiene todas las publicaciones de arte. | Pública en el controller |
| `GET` | `/Art/ArtPost/:id` | Obtiene una publicación por identificador. | Pública |
| `POST` | `/Art/PostArt` | Crea una publicación de arte y sube su imagen. | `SupabaseAuthGuard` |

`POST /Art/PostArt` recibe `multipart/form-data`:

- `title`
- `art_img` (archivo obligatorio)
- `description`
- `tags`
- `rating`

### Publicaciones de música

| Método | Endpoint | Descripción | Protección |
|---|---|---|---|
| `GET` | `/Music/MusicPosts` | Obtiene todas las publicaciones musicales. | Pública en el controller |
| `GET` | `/Music/MusicPost/:id` | Obtiene una publicación musical por identificador. | Pública |
| `POST` | `/Music/PostMusic` | Crea una publicación musical y sube audio y portada. | `SupabaseAuthGuard` |

`POST /Music/PostMusic` recibe `multipart/form-data`:

- `song_name`
- `song_file` (archivo obligatorio)
- `song_cover_img` (archivo obligatorio)
- `song_description`
- `tags`
- `rating`

El controller valida los tipos MIME del archivo de audio y de la portada.

### Ofertas de proyectos / trabajo

| Método | Endpoint | Descripción | Protección |
|---|---|---|---|
| `GET` | `/JobOffer/JobOfferPosts` | Obtiene todas las ofertas de proyectos. | Pública en el controller |
| `GET` | `/JobOffer/JobOfferPost/:id` | Obtiene una oferta por identificador. | Pública |
| `POST` | `/JobOffer/PostJobOffer` | Crea una oferta asociada al usuario autenticado. | `SupabaseAuthGuard` |

**Cuerpo orientativo de creación:**

```json
{
  "project_title": "Desarrollo de videojuego",
  "project_info": "Buscamos colaboradores para un proyecto indie",
  "email": "contacto@example.com",
  "tags": ["programación", "arte"]
}
```

### Endpoint raíz y documentación

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/` | Endpoint raíz de NestJS que devuelve el mensaje configurado por `AppService`. |
| `GET` | `/secret` | Interfaz de Swagger/OpenAPI para explorar la documentación de la API. |

La ruta raíz también está bajo el prefijo global de NestJS. La interfaz Swagger se monta explícitamente en `secret`; conviene comprobar en el entorno desplegado que el path publicado sea accesible.

> Las rutas de la tabla son paths relativos al prefijo global `/api`, excepto Swagger, que se monta en `/secret`. No se incluyen endpoints de películas ni videojuegos.

## Autenticación y archivos

### Autenticación

El backend utiliza el SDK de Supabase:

- `signUp()` para registrar usuarios.
- `signInWithPassword()` para autenticar con email y contraseña.
- `refreshSession()` para renovar la sesión.
- `signOut()` para cerrar sesión.

En el login, el backend devuelve el access token y refresh token. El frontend los guarda en `localStorage`. La utilidad `refreshToken()` utiliza el refresh token para solicitar nuevos tokens al endpoint `/Auth/Refresh`.

Los endpoints protegidos utilizan `SupabaseAuthGuard`. El guard obtiene la identidad autenticada para que los controladores puedan acceder a `req.user.id`.

### Almacenamiento

`StorageService` encapsula operaciones de Supabase Storage:

- `uploadFile(bucket, path, file)`: sube un archivo y devuelve su URL pública.
- `getPublicUrl(bucket, path)`: obtiene la URL pública.
- `deleteFile(bucket, path)`: elimina un archivo.

El servicio de perfiles utiliza el bucket `USERS` para almacenar avatares. Los servicios de publicaciones gestionan los archivos multimedia de sus respectivos módulos.

## Despliegue y CI/CD

El repositorio contiene `render.yaml`, que declara dos servicios:

1. Frontend estático construido desde `frontend`.
2. Backend Node construido desde `backend`.

También existe `.github/workFlows/ci.yaml`, que define un workflow de GitHub Actions.

### Qué hace `render.yaml`

- Declara servicios de Render.
- Establece el tipo de runtime.
- Define el directorio raíz de cada servicio (`rootDir`).
- Define comandos de instalación/build y publicación.
- Configura una regla de rewrite para que las rutas de la SPA frontend terminen sirviendo `index.html`.

### Observaciones que conviene revisar antes de desplegar

La configuración versionada presenta algunos puntos que merecen verificación:

- Los nombres declarados en Render son `ecobite-frontend` y `ecobite-backend`, aunque el repositorio se llama CREADOR.
- `render.yaml` utiliza `yarn install --frozen-lockfile`, pero los directorios revisados contienen `bun.lock`; no se observó un `yarn.lock` en esos directorios.
- El servicio backend declara `buildCommand: yarn install --frozen-lockfile` y `startCommand: yarn start`. El script `start` ejecuta `nest start`; el script `build` existe, pero no aparece en el `buildCommand` de Render.
- El README de backend menciona Yarn para despliegue, mientras que el desarrollo local está documentado con Bun.

Estos puntos no demuestran por sí solos que el despliegue esté fallando, pero sí indican que hay que alinear el gestor de paquetes, el lockfile y los comandos de build/start con la estrategia real de Render.

## Consideraciones técnicas

- **No confundir autenticación de frontend con autorización de backend:** una ruta protegida en React mejora la navegación, pero la seguridad real debe aplicarse en el backend con guards y políticas de datos.
- **Revisar la persistencia de tokens:** el frontend guarda tokens en `localStorage`; esto tiene implicaciones ante vulnerabilidades XSS. Conviene evaluar una estrategia de cookies `HttpOnly`, `Secure` y `SameSite` si la arquitectura lo permite.
- **Revisar RLS:** el uso de la clave `anon` en el backend requiere políticas de acceso adecuadas en Supabase. La clave pública no debe considerarse una autorización suficiente.
- **Validar DTOs:** el proyecto tiene `ValidationPipe` global, pero es importante que los DTOs declaren validadores (`class-validator`) para que `whitelist` y la validación de payloads tengan efecto real.
- **Documentar CORS:** actualmente se habilita CORS sin opciones explícitas; en producción conviene restringir los orígenes permitidos.
- **Revisar logging:** evitar registrar tokens, credenciales, datos personales o contenido sensible de archivos.
- **Mantener consistencia de rutas:** los paths de los controladores utilizan mayúsculas (`Auth`, `Users`, `Art`, etc.). Los clientes deben consumir exactamente las rutas publicadas.
- **Separación de responsabilidades:** los controladores manejan HTTP; los servicios contienen la lógica y la integración con Supabase; `SupabaseService` centraliza la creación del cliente.

## Referencias del proyecto

- Repositorio: https://github.com/TrollerImpala/CREADOR
- Backend: `backend/src`
- Frontend: `frontend/src`
- Configuración de Render: `render.yaml`
- Workflow: `.github/workFlows/ci.yaml`
- Documentación funcional y técnica: documento CREADOR entregado con el proyecto.
