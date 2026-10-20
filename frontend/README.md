# Frontend Project

## Local development
This frontend is intended to be developed with Bun locally.

```bash
$ bun install
$ bun run dev -- --host 0.0.0.0
```

## Production / deploy
Render uses Yarn for production-oriented install and build steps, aligned with [render.yaml](../render.yaml).

```bash
$ yarn install --frozen-lockfile
$ yarn build
```

## Notes
- Vite configuration is defined in [vite.config.ts](vite.config.ts)
- The SPA consumes the NestJS API at `http://localhost:8080` during local development
- Production values and environment configuration must be set in the host platform, not committed to the repository
