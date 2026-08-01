import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Report } from '@/lib/models';
import { getSesion } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req, { params }) {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { texto, evidencias } = await req.json();
  if (!texto?.trim() && !(evidencias?.length))
    return NextResponse.json({ error: 'Escribe un comentario o adjunta evidencia' }, { status: 400 });
  await dbConnect();
  const comentario = {
    texto: texto?.trim() || '',
    autorNombre: sesion.nombre,
    autorRol: sesion.rol,
    evidencias: Array.isArray(evidencias) ? evidencias : [],
    createdAt: new Date(),
  };
  const report = await Report.findByIdAndUpdate(
    params.id,
    { $push: { comentarios: comentario } },
    { new: true }
  ).lean();
  if (!report) return NextResponse.json({ error: 'No existe' }, { status: 404 });
  return NextResponse.json(report.comentarios[report.comentarios.length - 1]);
}
