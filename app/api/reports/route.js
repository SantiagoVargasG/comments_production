import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Report } from '@/lib/models';
import { getSesion } from '@/lib/auth';
import { TIPOS, PRIORIDADES, ESTADOS, AMBIENTES } from '@/lib/constants';

export const runtime = 'nodejs';

export async function GET(req) {
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
  const reports = await Report.find(q)
    .select('-comentarios')
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(reports);
}

export async function POST(req) {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  if (!body.modulo || !body.descripcion)
    return NextResponse.json({ error: 'Módulo y descripción son obligatorios' }, { status: 400 });
  await dbConnect();

  const esTech = sesion.rol === 'tech';
  const doc = {
    modulo: body.modulo,
    descripcion: body.descripcion.trim(),
    tipo: TIPOS.includes(body.tipo) ? body.tipo : 'Error',
    evidencias: Array.isArray(body.evidencias) ? body.evidencias : [],
    creadoPorRol: sesion.rol,
    creadoPorNombre: sesion.nombre,
  };

  if (esTech) {
    // tech puede definir estados
    doc.prioridad = PRIORIDADES.includes(body.prioridad) ? body.prioridad : null;
    doc.estado = ESTADOS.includes(body.estado) ? body.estado : null;
    doc.ambiente = AMBIENTES.includes(body.ambiente) ? body.ambiente : 'Pendiente';
    doc.version = body.version || '';
  } else {
    // cliente: SIN estados, para identificarlo fácil
    doc.prioridad = null;
    doc.estado = null;
    doc.ambiente = 'Pendiente';
    doc.version = '';
  }

  // consecutivo por módulo
  const ultimo = await Report.findOne({ modulo: doc.modulo }).sort({ consecutivo: -1 }).select('consecutivo').lean();
  doc.consecutivo = (ultimo?.consecutivo || 0) + 1;

  const report = await Report.create(doc);
  return NextResponse.json(report);
}
