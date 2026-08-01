import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Report } from '@/lib/models';
import { getSesion } from '@/lib/auth';
import { TIPOS, PRIORIDADES, ESTADOS, AMBIENTES } from '@/lib/constants';
import { withErrorHandling } from '@/lib/apiHandler';
import { puedeEditarReporte } from '@/lib/reportRules';

export const runtime = 'nodejs';

export const GET = withErrorHandling(async (_req, { params }) => {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  await dbConnect();
  const report = await Report.findById(id).lean();
  if (!report) return NextResponse.json({ error: 'No existe' }, { status: 404 });
  return NextResponse.json(report);
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  const sesion = await getSesion();
  if (!puedeEditarReporte(sesion?.rol))
    return NextResponse.json({ error: 'Solo el equipo tech puede editar' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  await dbConnect();
  const set = {};
  if (typeof body.descripcion === 'string') set.descripcion = body.descripcion.trim();
  if (TIPOS.includes(body.tipo)) set.tipo = body.tipo;
  if (body.prioridad === null || PRIORIDADES.includes(body.prioridad)) set.prioridad = body.prioridad;
  if (body.estado === null || ESTADOS.includes(body.estado)) set.estado = body.estado;
  if (AMBIENTES.includes(body.ambiente)) set.ambiente = body.ambiente;
  if (typeof body.version === 'string') set.version = body.version;
  const report = await Report.findByIdAndUpdate(id, { $set: set }, { returnDocument: 'after' }).lean();
  if (!report) return NextResponse.json({ error: 'No existe' }, { status: 404 });
  return NextResponse.json(report);
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  const sesion = await getSesion();
  if (!puedeEditarReporte(sesion?.rol))
    return NextResponse.json({ error: 'Solo el equipo tech puede eliminar' }, { status: 403 });
  const { id } = await params;
  await dbConnect();
  const report = await Report.findByIdAndDelete(id).lean();
  if (!report) return NextResponse.json({ error: 'No existe' }, { status: 404 });
  return NextResponse.json({ ok: true });
});
