# GR Wall UI

Microfrontend del muro de comunicaciones de Gestión Residencial: consulta para RESIDENTE y VIGILANTE, gestión para ADMINISTRACION.

## Por qué existe este repositorio

El resto de los frontends está organizado por rol (`gr-common-ui`, `gr-admin-ui`, `gr-auth-ui`). El muro rompe ese patrón a propósito: vive en su propio microfrontend, simétrico con `gr-wall-microservice`, un repo por dominio en vez de por rol. Los tres roles que consumen el muro (residente, vigilante, administración) comparten esta misma aplicación en vez de reimplementar la vista en cada app de rol.

## Biblioteca compartida

Consume, como dependencias npm normales (no hay workspace compartido con `gr-common-ui`):

- [`@gestionresidencial/shared-ui`](https://www.npmjs.com/package/@gestionresidencial/shared-ui) — `AppShell`, `EmptyState`, primitivos.
- [`@gestionresidencial/auth-client`](https://www.npmjs.com/package/@gestionresidencial/auth-client) — `apiFetch`, `authService`, `decideSessionAccess`, `SsoCallbackScreen`, `authUiLoginUrl`.

Antes de agregar algo aquí, lee la [guía de contribución](https://github.com/GestionResidencialPoli/gr-common-ui/blob/main/docs/contribuir.md) de `gr-common-ui`: si el cambio no es específico de este repositorio, probablemente pertenece a uno de los dos paquetes.

## Cómo se llega aquí

No hay login propio. Un usuario ya autenticado en `gr-common-ui` (residente o vigilante) o `gr-admin-ui` (administración) navega al módulo del muro; esa app inicia un intercambio SSO (mismo mecanismo de `GR-151`: código de un solo uso, audiencia según el rol) y redirige a `/auth/sso/callback?code=...` de este origen. Igual que en `gr-admin-ui` y `gr-common-ui`, el canje ocurre desde este origen porque las cookies de sesión son host-only (ver [ADR-001](https://github.com/GestionResidencialPoli/gr-user-microservice/blob/main/docs/decisiones/ADR-001-estrategia-tokens.md) en `gr-user-microservice`).

## Backend

Todas las llamadas van a `/api/v1/publicaciones` (`gr-wall-microservice`) a través del gateway (`gr-api-gateway`). `BACKEND_API_URL` debe apuntar al gateway (`http://localhost:4000` en local), no a un microservicio directo.

## Desarrollo local

```bash
pnpm install
pnpm dev   # puerto 3003
```

Requiere el stack de backend corriendo (`docker compose up` en `gr-api-gateway`) y las variables de `.env.example`.
