import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Report } from '@/lib/models';
import { getSesion } from '@/lib/auth';
import { TIPOS, PRIORIDADES, ESTADOS, AMBIENTES } from '@/lib/constants';

export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  await dbConnect();
  const report = await Report.findById(params.id).lean();
  if (!report) return NextResponse.json({ error: 'No existe' }, { status: 404 });
  return NextResponse.json(report);
}

export async function PATCH(req, { params }) {
  const sesion = await getSesion();
  if (sesion?.rol !== 'tech')
    return NextResponse.json({ error: 'Solo el equipo tech puede editar' }, { status: 403 });
  const body = await req.json();
  await dbConnect();
  const set = {};
  if (typeof body.descripcion === 'string') set.descripcion = body.descripcion.trim();
  if (TIPOS.includes(body.tipo)) set.tipo = body.tipo;
  if (body.prioridad === null || PRIORIDADES.includes(body.prioridad)) set.prioridad = body.prioridad;
  if (body.estado === null || ESTADOS.includes(body.estado)) set.estado = body.estado;
  if (AMBIENTES.includes(body.ambiente)) set.ambiente = body.ambiente;
  if (typeof body.version === 'string') set.version = body.version;
  const report = await Report.findByIdAndUpdate(params.id, { $set: set }, { new: true }).lean();
  if (!report) return NextResponse.json({ error: 'No existe' }, { status: 404 });
  return NextResponse.json(report);
}
