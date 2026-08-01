import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSesion } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req) {
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

  const blob = await put(`evidencias/${Date.now()}-${file.name}`, file, { access: 'public' });
  return NextResponse.json({
    url: blob.url,
    tipo: esVideo ? 'video' : 'imagen',
    nombre: file.name,
  });
}
