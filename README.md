# Comentarios de producción

App de seguimiento de reportes (errores, mejoras y nuevos requerimientos) por módulo, con
roles **tech** y **cliente**, evidencias en foto/video y filtros. Lista para desplegar en Vercel.

Stack: Next.js 14 (App Router) · MongoDB (Mongoose) · Vercel Blob (evidencias) · JWT + bcrypt.

## Qué hace

- **Login** con sesión JWT en cookie httpOnly. El registro de usuarios lo hace el **tech** (correo, nombre, contraseña) desde *Usuarios*.
- **Roles**
  - **Cliente:** crea reportes (quedan **sin estado**), ve la tabla, entra al detalle y comenta con evidencia. No cambia estados, prioridad ni ambiente.
  - **Tech:** todo lo anterior + define estados y **edita** cualquier reporte.
- **Módulo 1 Loopzii / Módulo 2 GoFixii**, cada uno con su tabla: #, comentario, tipo, prioridad, estado, ambiente, versión y fecha, con *ver detalle*.
- **Detalle:** metadatos, evidencias del reporte, hilo de comentarios (tech y cliente) con foto/video, y edición para tech.
- **Filtros** por ambiente y por rango de fechas.
- Reporte creado por cliente se resalta y queda sin estado para identificarlo rápido.

## Configuración local

1. `npm install`
2. Copia `.env.example` a `.env` y completa:
   - `MONGODB_URI` — crea un cluster gratis en MongoDB Atlas.
   - `JWT_SECRET` — `openssl rand -base64 32`.
   - `BLOB_READ_WRITE_TOKEN` — solo para subir evidencias (ver Vercel Blob abajo).
3. Crea el primer usuario tech e importa tus 90 reportes del Excel:
   ```
   ADMIN_EMAIL=tucorreo@x.com ADMIN_PASSWORD=tuclave npm run seed
   ```
4. `npm run dev` → http://localhost:3000

## Desplegar en Vercel

1. Sube el repo a GitHub e impórtalo en Vercel.
2. En **Settings → Environment Variables** agrega `MONGODB_URI` y `JWT_SECRET`.
3. En **Storage → Blob** crea un store; Vercel inyecta `BLOB_READ_WRITE_TOKEN` solo.
4. Deploy. Corre el seed una vez apuntando a la misma `MONGODB_URI` (desde local con el `.env` de producción).

## Notas

- Las evidencias se guardan en Vercel Blob (públicas por URL). Si necesitas acceso privado, cámbialo en `app/api/upload/route.js`.
- El seed importa los reportes como tipo Error / Nuevo requerimiento. Reclasifica a "Mejora" desde el detalle.
- Los "Finalizado" sin ambiente se importaron como Producción: revísalos.
