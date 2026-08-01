import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSesion } from '@/lib/auth';
import { withErrorHandling } from '@/lib/apiHandler';

export const runtime = 'nodejs';

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

export const POST = withErrorHandling(async (req) => {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ error: 'Falta configurar Vercel Blob (BLOB_READ_WRITE_TOKEN)' }, { status: 500 });

  const form = await req.formData();
  const file = form.get('file');
  if (!file) return NextResponse.json({ error: 'No se envió archivo' }, { status: 400 });

  const esVideo = file.type.startsWith('video/');
  const esImagen = file.type.startsWith('image/');
  if (!esVideo && !esImagen)
    return NextResponse.json({ error: 'Solo se permiten imágenes o videos' }, { status: 400 });

  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: 'El archivo supera el límite de 20 MB' }, { status: 413 });

  const blob = await put(`evidencias/${Date.now()}-${file.name}`, file, { access: 'public' });
  return NextResponse.json({
    url: blob.url,
    tipo: esVideo ? 'video' : 'imagen',
    nombre: file.name,
  });
});
