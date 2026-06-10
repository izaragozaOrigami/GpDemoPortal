# Módulo Buzón (APP 04)

Bandeja simulada por sesión demo. Lee el buzón compartido M365
`demo-gpfleet@kubus-tech.com.mx` vía Microsoft Graph (app-only), filtra por el
tag `[UID:<guid>]` que API Flotas inyecta en el asunto, oculta el tag y agrupa
los correos en 4 carpetas por flujo de negocio.

## Arquitectura
- **Frontend**: rutas nativas Next `/login` y `/apps/buzon` (3 columnas:
  carpetas | lista | lectura, responsive). Diseño GP Fleet (dark + naranja).
- **Backend**: route handlers Next (Node runtime), no es un servicio aparte:
  - `POST /api/auth/login`  · `POST /api/auth/logout`
  - `GET  /api/demo/mailbox`        → lista del usuario en sesión
  - `GET  /api/demo/mailbox/{id}`   → detalle (HTML saneado), re-valida pertenencia
- **Identidad**: Origami.Identity. El `userId` = claim `nameidentifier` (GUID).
  El backend lo saca del token/cookie, NUNCA de un query param.
- **Clasificación de carpetas**: `src/lib/buzon/classify.ts` (derivada del Excel
  de endpoints de API Flotas). Carpetas: Refacciones/Compras, Mantenimiento
  Externo, Reporte de bajas, Otros.

> ⚠️ Este repo dejó de usar `output: "export"`. El módulo Buzón necesita un
> runtime de servidor (route handlers con el secreto de Graph), así que el sitio
> debe desplegarse como **app Node** (Azure App Service Node), no como estático.

## Variables de entorno (`.env.local`, en .gitignore — NO se sube)
```
GRAPH_TENANT_ID=...
GRAPH_CLIENT_ID=...
GRAPH_CLIENT_SECRET=...
GRAPH_MAILBOX=demo-gpfleet@kubus-tech.com.mx

# Identidad (Origami.Identity)
USERSERVICE_URL=          # base URL del userservice (termina en /). Vacío = MODO DEV
JWT_SIGNING_KEY=          # llave HS256; si está, se VERIFICA la firma del JWT
JWT_ISSUER=Origami.Identity
JWT_AUDIENCE=Origami.Identity

DEMO_USER_ID=<guid>       # fallback de login en MODO DEV
```

## Modos
- **DEV** (sin `USERSERVICE_URL`): el login acepta cualquier credencial y crea la
  sesión con `DEMO_USER_ID`. Sirve para probar contra el buzón real en local.
- **REAL**: el login hace proxy a `${USERSERVICE_URL}Accounts/Login`, guarda el
  JWT en cookie httpOnly y el backend valida la firma con `JWT_SIGNING_KEY`.

## Pendientes para producción
- Poner `USERSERVICE_URL` + `JWT_SIGNING_KEY` reales (hoy faltan).
- Secreto de Graph en Key Vault / App Service settings (no en `.env.local` del server).
- Confirmar política `New-ApplicationAccessPolicy` que encierra la app al buzón.
