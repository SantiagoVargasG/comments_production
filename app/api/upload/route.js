import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { getSesion } from '@/lib/auth';
import { withErrorHandling } from '@/lib/apiHandler';

export const runtime = 'nodejs';

// Límite generoso pensado para video (la subida va directo del navegador a
// Vercel Blob, no pasa por esta función, así que no choca con el límite de
// ~4.5 MB que Vercel impone al body de una función serverless normal).
const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

export const POST = withErrorHandling(async (req) => {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ error: 'Falta configurar Vercel Blob (BLOB_READ_WRITE_TOKEN)' }, { status: 500 });

  const body = await req.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const tipo = clientPayload || '';
        if (!tipo.startsWith('image/') && !tipo.startsWith('video/')) {
          throw new Error('Solo se permiten imágenes o videos');
        }
        return {
          allowedContentTypes: ['image/*', 'video/*'],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: false,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'No se pudo iniciar la subida' }, { status: 400 });
  }
});
