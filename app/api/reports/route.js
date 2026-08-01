import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Report, siguienteConsecutivo } from '@/lib/models';
import { getSesion } from '@/lib/auth';
import { withErrorHandling } from '@/lib/apiHandler';
import { construirCamposPorRol } from '@/lib/reportRules';

export const runtime = 'nodejs';

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

export const GET = withErrorHandling(async (req) => {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = {};
  const modulo = searchParams.get('modulo');
  if (modulo) q.modulo = modulo;
  const ambiente = searchParams.get('ambiente');
  if (ambiente) q.ambiente = ambiente;
  const desde = searchParams.get('desde');
  const hasta = searchParams.get('hasta');
  if (desde || hasta) {
    q.createdAt = {};
    if (desde) q.createdAt.$gte = new Date(desde);
    if (hasta) { const h = new Date(hasta); h.setHours(23, 59, 59, 999); q.createdAt.$lte = h; }
  }

  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
  const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, parseInt(searchParams.get('limit'), 10) || PAGE_SIZE_DEFAULT));

  const [items, total] = await Promise.all([
    Report.find(q)
      .select('-comentarios')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Report.countDocuments(q),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
});

export const POST = withErrorHandling(async (req) => {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  if (!body.modulo || !body.descripcion)
    return NextResponse.json({ error: 'Módulo y descripción son obligatorios' }, { status: 400 });
  if (!body.descripcion.trim())
    return NextResponse.json({ error: 'Módulo y descripción son obligatorios' }, { status: 400 });
  await dbConnect();

  const doc = {
    ...construirCamposPorRol(sesion.rol, body),
    creadoPorRol: sesion.rol,
    creadoPorNombre: sesion.nombre,
    consecutivo: await siguienteConsecutivo(body.modulo),
  };

  const report = await Report.create(doc);
  return NextResponse.json(report);
});
