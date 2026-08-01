# Auditoría base — Comentarios de producción

Fecha: 2026-07-31. Alcance: lectura completa del código fuente (sin ejecutar la app todavía). Objetivo: dejar constancia de qué hace el proyecto hoy, como línea base antes de correrlo y de futuras iteraciones.

## Stack

- **Next.js 14** (App Router, `app/`), React 18.
- **MongoDB + Mongoose** (`lib/mongodb.js`, `lib/models.js`) — conexión cacheada en `global._mongoose` para reusar en dev/hot-reload.
- **Vercel Blob** (`@vercel/blob`) para almacenar evidencias (foto/video), acceso público por URL.
- **Auth propia**: JWT firmado con `jose`, cookie httpOnly `sesion` (7 días), passwords con `bcryptjs`.
- **Tailwind** para estilos.
- Sin tests automatizados, sin CI, sin repo git inicializado.

## Modelo de datos (`lib/models.js`)

- **User**: `nombre`, `correo` (único), `passwordHash`, `rol` (`tech` | `cliente`, default `cliente`).
- **Report**: `modulo` (`loopzii` | `gofixii`), `consecutivo` (numérico, calculado por módulo), `descripcion`, `tipo` (Error/Mejora/Nuevo requerimiento), `prioridad` (Baja/Media/Alta o `null`), `estado` (Por hacer/En progreso/Finalizado o `null`), `ambiente` (Pendiente/Desarrollo/Producción), `version`, `evidencias[]`, `comentarios[]` (con su propia lista de evidencias), `creadoPorRol`, `creadoPorNombre`.
- Constantes centralizadas en `lib/constants.js` (tipos, prioridades, estados, ambientes y colores de badges).

## Auth y control de acceso

- `middleware.js` protege todas las rutas excepto `/login` y `/api/auth/login`: sin sesión válida redirige a `/login` (páginas) o responde 401 (API).
- Rol se lee del payload del JWT, no se re-consulta a BD en cada request — si cambias el rol de un usuario, su sesión activa sigue con el rol viejo hasta que vuelva a iniciar sesión.
- **Reglas de negocio observadas en las rutas API** (`app/api/**`):
  - `POST /api/reports`: cualquier usuario autenticado crea reportes. Si es `cliente`, el backend **fuerza** `prioridad/estado = null` y `ambiente = 'Pendiente'` ignorando lo que mande el body — la restricción está bien aplicada server-side, no solo en la UI.
  - `PATCH /api/reports/[id]`: solo `rol === 'tech'` puede editar (403 si no).
  - `POST /api/reports/[id]/comments`: cualquier autenticado puede comentar con texto y/o evidencia.
  - `GET/POST /api/users`: solo `tech` puede listar o crear usuarios. No hay endpoint para editar/eliminar usuarios.
  - No existen endpoints DELETE para reportes, comentarios ni usuarios.
  - `POST /api/upload`: valida que el archivo sea imagen o video antes de subir a Blob; requiere sesión y `BLOB_READ_WRITE_TOKEN`.
- Fallback inseguro: si `JWT_SECRET` no está definido, `lib/auth.js` usa `'dev-secret-cambiar'` como secreto. Aceptable en dev, pero conviene que en producción falle explícitamente si falta la env var.

## Flujo funcional (UI)

- `/` redirige a `/modulos` (con sesión) o `/login`.
- `/login`: formulario simple contra `/api/auth/login`.
- `(app)/modulos`: cards para elegir Loopzii o GoFixii.
- `(app)/modulos/[modulo]` (`ModuleView.jsx`): tabla de reportes con filtros por ambiente y rango de fechas (`desde`/`hasta`, cliente-side vía querystring a `GET /api/reports`), botón "Nuevo reporte" que abre `ReportForm` (modal). Fila sin `estado` se resalta en fucsia para identificar reportes de cliente pendientes de revisión.
- `ReportForm.jsx`: cliente solo ve tipo/descripción/evidencia; tech además ve prioridad/estado/ambiente/versión.
- `(app)/reportes/[id]` (`ReportDetail.jsx`): metadatos, evidencias del reporte, hilo de comentarios, formulario para comentar con evidencia, y edición completa (solo tech) de descripción/tipo/prioridad/estado/ambiente/versión.
- `(app)/admin/usuarios`: solo tech (si un cliente entra por URL, se redirige a `/modulos`); alta de usuarios y tabla de listado. **El input de contraseña es `type="text"`**, queda visible en pantalla al escribirla — no es un bug funcional pero sí un detalle de UX/seguridad a considerar.

## Seed (`scripts/seed.mjs` + `scripts/seed-data.json`)

- Crea el usuario tech inicial (`ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NOMBRE` por env, con defaults de desarrollo) solo si no existe.
- Importa `scripts/seed-data.json` (901 líneas ≈ ~90 reportes) **solo si la colección `Report` está vacía** — no es idempotente para actualizar datos, es "todo o nada" en la primera corrida.
- **Hallazgo**: el JSON trae la clave `creadoPor` (ej. `"creadoPor": "tech"`), pero el schema y el resto de la app usan `creadoPorRol`. El seed nunca mapea ese campo, así que los reportes importados quedarán con `creadoPorRol` vacío/undefined — en `ReportDetail` se vería "Creado por Santi ·" sin rol. Es cosmético (no rompe nada), pero vale la pena confirmarlo al revisar los datos importados y decidir si se corrige el script o se ignora.

## Gaps / riesgos a tener en cuenta (no son bugs de build, son de alcance)

- Sin paginación en `GET /api/reports` — con ~90 reportes por módulo no es problema hoy, pero no escala indefinidamente.
- Sin borrado de reportes/comentarios/usuarios (puede ser intencional para mantener historial completo).
- Sin CSRF token explícito (mitigado parcialmente por `sameSite: 'lax'` + que las rutas mutantes están detrás de sesión).
- Consecutivo por módulo se calcula con un `findOne().sort()` antes de insertar — en creación concurrente muy simultánea podría, en teoría, repetirse un consecutivo (condición de carrera improbable con el volumen de uso esperado).
- No hay `.env` real todavía, ni `node_modules` estaba instalado antes de esta sesión (ya se instaló).

## Estado de esta sesión

- `npm install` ejecutado con éxito (129 paquetes).
- `.env.local` creado con `JWT_SECRET` generado; `MONGODB_URI` y `BLOB_READ_WRITE_TOKEN` pendientes de que el usuario los provea.
- Pendiente: correr seed, levantar `npm run dev`, probar flujos end-to-end, verificar `next build`, y preparar deploy a Vercel.
