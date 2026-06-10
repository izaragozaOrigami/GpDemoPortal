# Despliegue en Azure — Portal GP Fleet Demo (`/demoapps`)

> Para: Daniel · Contexto del front: este portal **ya no es un sitio estático**.
> Cambió a una **app Node (Next.js standalone)** porque el módulo Buzón necesita
> servidor (rutas `/api` que leen Microsoft Graph con un secreto). Por eso ya no
> sirve subir un `out/` plano por FTP; ahora se despliega como aplicación Node.

---

## 1. Qué se entrega

- **`gpdemoportal-standalone.zip`** (~11 MB) — build autocontenido. Incluye:
  - `server.js` — servidor Node de arranque (lo lanza IIS).
  - `web.config` — config de **HttpPlatformHandler** (IIS → Node).
  - `.next/` y `.next/static/` — build del servidor + assets.
  - `public/` — imágenes y estáticos.
  - `node_modules/` — dependencias mínimas (NO hace falta `npm install` en el server).
  - `logs/` — aquí HttpPlatformHandler escribe `node.log` (diagnóstico).

- La app corre bajo el subpath **`/demoapps`** (está fijado en el build con
  `basePath`). La URL final es:
  `https://gpfleetdemosite.azurewebsites.net/demoapps`

---

## 2. Requisitos del App Service

| Requisito | Valor | Cómo verificar |
|---|---|---|
| Sistema operativo | **Windows** | Es el sitio actual (IIS + web.config). |
| Stack | **Node** | Portal → Configuration → General settings → Stack = Node. Si no es Node, `node.exe` no está en PATH. |
| Versión de Node | **≥ 20.9** (Next 16 lo exige) | App setting `WEBSITE_NODE_DEFAULT_VERSION` = `~20` o superior. |
| Módulo | **HttpPlatformHandler** | Ya viene en Azure App Service Windows. |
| `/demoapps` | **Aplicación virtual** (no directorio) | Configuration → Path mappings → Virtual applications. Marcar como *Application*. |

---

## 3. El error que salió y por qué

> **"The specified CGI application encountered an error and the server terminated the process."**

Es un error de **HttpPlatformHandler**: IIS intentó arrancar el proceso Node y
**murió** (o no pudo arrancarlo). El bundle está bien (se probó en local y sirve
`/demoapps`). Las causas, en orden de probabilidad:

### Causa A — Faltaba la carpeta `logs/` (ya corregido)
El `web.config` escribe su log en `.\logs\node.log`. Si esa carpeta no existe,
HttpPlatformHandler **no puede arrancar el proceso** y da ese error. El nuevo zip
ya incluye `logs/`.

### Causa B — Ruta de `node.exe` incorrecta (verificar)
El `web.config` trae por defecto:
```
processPath="C:\Program Files\nodejs\node.exe"
```
Pero en Azure App Service Windows **el Node está versionado** y **NO existe** una
ruta sin versión. Hay que poner la real (ver paso 4.2).

### Causa C — Versión de Node muy vieja
Si `WEBSITE_NODE_DEFAULT_VERSION` apunta a < 20.9, el proceso arranca y muere con
el mismo error. Subirla a `~20`+.

---

## 4. Pasos de despliegue

### 4.1 Subir el contenido del zip
Descomprime y sube **el contenido** del zip a la raíz de la app virtual
(`…\site\wwwroot\demoapps`). `server.js` y `web.config` deben quedar en la **raíz**
de esa carpeta (no dentro de un subdirectorio).

> Si prefieres ZIP Deploy (Kudu → Tools → Zip Push Deploy), arrástralo ahí.

### 4.2 Poner la ruta REAL de Node en `web.config`
En **Kudu** (`https://gpfleetdemosite.scm.azurewebsites.net` → *Debug console* →
*CMD*) ejecuta:
```
where node
```
Devolverá algo como `C:\Program Files\nodejs\20.19.0\node.exe`.
Pon **esa ruta exacta** en `processPath` del `web.config`:
```xml
<httpPlatform ... processPath="C:\Program Files\nodejs\20.19.0\node.exe" arguments=".\server.js">
```
> Alternativa sin tocar la ruta: `processPath="cmd.exe"` con
> `arguments="/c node .\server.js"` (resuelve node por PATH). Úsala solo si el
> stack está como Node y la ruta versionada te da problemas.

### 4.3 Configurar variables de entorno (Application settings)
En el portal → **Configuration → Application settings** (NO en el zip):

| Variable | Para qué | Valor |
|---|---|---|
| `WEBSITE_NODE_DEFAULT_VERSION` | Versión de Node | `~20` (o superior) |
| `GRAPH_TENANT_ID` | Microsoft Graph | *(del registro de app)* |
| `GRAPH_CLIENT_ID` | Microsoft Graph | *(del registro de app)* |
| `GRAPH_CLIENT_SECRET` | Microsoft Graph | *(secreto — idealmente Key Vault)* |
| `GRAPH_MAILBOX` | Buzón compartido | `demo-gpfleet@kubus-tech.com.mx` |
| `USERSERVICE_URL` | Login real (Origami.Identity) | `https://gpfleetdemousersservice.azurewebsites.net/api/` |
| `JWT_SIGNING_KEY` | Verificar firma del JWT | *(llave HS256)* |
| `JWT_ISSUER` | Claims | `Origami.Identity` |
| `JWT_AUDIENCE` | Claims | `Origami.Identity` |
| `DEMO_USER_ID` | Fallback login modo DEV | *(GUID, opcional)* |

**Modos de login:**
- **REAL**: con `USERSERVICE_URL` → el login hace proxy a Origami.Identity y guarda
  el JWT en cookie httpOnly.
- **DEV** (sin `USERSERVICE_URL`): acepta el login con `DEMO_USER_ID` como sesión.
  Útil para probar el buzón real sin el userservice.

### 4.4 Reiniciar la app
Tras tocar `web.config` o settings, **Restart** del App Service.

---

## 5. Verificación

1. `https://gpfleetdemosite.azurewebsites.net/demoapps` → debe redirigir a
   `/demoapps/login` (HTTP 307) y mostrar la pantalla de login.
2. `…/demoapps/bg-login.png` → debe responder **200** (assets bajo el subpath OK).
3. Login → portal con las apps (Buzón, Checklist, Neumáticos).
4. Abrir **Buzón** → si Graph está bien configurado, carga la bandeja; si no,
   muestra error controlado (502 en `/api/demo/mailbox`), pero el sitio NO se cae.

---

## 6. Si sigue fallando — leer el log

El motivo EXACTO queda en:
```
…\site\wwwroot\demoapps\logs\node.log
```
También en el portal: **Monitoring → Log stream**. Búscalo y mándamelo; ahí se ve
si es la ruta de Node, la versión, o un crash de código.

| Síntoma en el log | Causa probable | Acción |
|---|---|---|
| No se crea `node.log` | Ruta de `node.exe` mala (4.2) o `logs/` no existe | Corregir `processPath` / re-subir bundle con `logs/` |
| `SyntaxError` / `Unexpected token` al iniciar | Node demasiado viejo | Subir `WEBSITE_NODE_DEFAULT_VERSION` |
| Arranca pero `/demoapps` da 404 | `/demoapps` no es *Application* virtual | Marcarla como Application (paso 2) |
| Bandeja 502, resto OK | Faltan `GRAPH_*` o el access policy del buzón | Completar settings de Graph |

---

## 7. Notas / pendientes

- El secreto de Graph debería ir en **Key Vault** o App settings, no en el zip.
- Falta confirmar la política `New-ApplicationAccessPolicy` que encierra la app
  app-only al buzón `demo-gpfleet@kubus-tech.com.mx`.
- Detalle del módulo Buzón: ver [`docs/buzon.md`](./buzon.md).
- **Alternativa más simple** (si algún día se puede): desplegar en un App Service
  **Linux** con stack Node y *Startup Command* `node server.js`. Evita IIS,
  `web.config` y el lío de la ruta de Node. Hoy estamos atados a Windows porque
  el portal vive como app virtual bajo un sitio Windows existente.
