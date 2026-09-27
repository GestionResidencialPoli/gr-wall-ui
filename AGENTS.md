# gr-wall-ui — contexto para agentes

Microfrontend del muro de comunicaciones (épica `GR-13` en Jira). Next.js 16 (App Router), consumido por los tres roles: RESIDENTE y VIGILANTE consultan, ADMINISTRACION gestiona.

## Convención de código

Sin comentarios en el código, salvo que el nombre de la variable/función no baste para explicar el qué (y aun así, preferir renombrar antes que comentar). Coincide con la convención del resto de los repos `gr-*`.

## Backend

Todo pasa por el gateway (`BACKEND_API_URL`, por defecto `http://localhost:4000` en local), nunca directo a un microservicio. El muro vive en `gr-wall-microservice` bajo `/api/v1/publicaciones`.

- Las respuestas de lectura/escritura individual vienen envueltas en `{ payload }`; el listado en `{ payload: { content, page, size, totalElements, totalPages } }`.
- Errores: `{ error: { message } }` (validación Zod agrega `details: [{ path, message }]`).
- Categorías fijas: `AVISO | NOTICIA | URGENTE | MANTENIMIENTO`.
- Máximo 3 publicaciones fijadas simultáneas (`409` si se excede).
- `vigenciaHasta` es opcional; sin fecha, la publicación no vence nunca.

Usar siempre `apiFetch` de `@gestionresidencial/auth-client`, nunca `fetch` directo: ya resuelve CSRF, `credentials: "include"` y el reintento tras 401.

## Autenticación

No hay login propio: se llega por el puente SSO (`/auth/sso/callback`, `SsoCallbackScreen` de `auth-client`). `proxy.ts` protege todo lo demás con `decideSessionAccess`. Las tres audiencias (`admin`, `residente`, `vigilante`) son válidas en este origen; el gating de "esto es solo para administración" ocurre a nivel de página con el prop `requiredRole` de `AuthenticatedShell`, no a nivel de proxy.

## Gitflow

Igual que los demás repos `gr-*`: `feature/GR-000-descripcion`, `fix/*`, `refactor/*` desde `develop`; `hotfix/*` desde `main`. Commits `tipo(scope): GR-000 descripcion breve`. PR por work item, vinculado a Jira.
