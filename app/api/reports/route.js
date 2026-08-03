import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Report, siguienteConsecutivo } from '@/lib/models';
import { getSesion } from '@/lib/auth';
import { withErrorHandling } from '@/lib/apiHandler';
import { construirCamposPorRol, coincideBusqueda, compararReportes } from '@/lib/reportRules';

export const runtime = 'nodejs';

const PAGE_SIZE_DEFAULT = 20;
// El tablero tipo Kanban pide todos los reportes del módulo de una vez
// (agrupados por estado), por eso el máximo es más alto que una página
// típica de tabla.
const PAGE_SIZE_MAX = 300;

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
  const tipo = searchParams.get('tipo');
  if (tipo) q.tipo = tipo;
  const desde = searchParams.get('desde');
  const hasta = searchParams.get('hasta');
  if (desde || hasta) {
    q.createdAt = {};
    if (desde) q.createdAt.$gte = new Date(desde);
    if (hasta) { const h = new Date(hasta); h.setHours(23, 59, 59, 999); q.createdAt.$lte = h; }
  }

  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
  const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, parseInt(searchParams.get('limit'), 10) || PAGE_SIZE_DEFAULT));
  const busqueda = (searchParams.get('busqueda') || '').trim();
  const orden = searchParams.get('orden'); // 'consecutivo_asc' | 'consecutivo_desc' | null (por defecto: más recientes primero)
  const sortSpec = orden === 'consecutivo_asc' ? { consecutivo: 1 } : orden === 'consecutivo_desc' ? { consecutivo: -1 } : { createdAt: -1 };

  let items, total;
  if (busqueda) {
    // Coincidencia flexible (tildes/mayúsculas/espacios, por # o
    // descripción) se resuelve en memoria: evita depender de índices de
    // texto o normalizar datos existentes en Mongo para esta búsqueda.
    const candidatos = await Report.find(q).select('-comentarios').lean();
    const filtrados = candidatos
      .filter((r) => coincideBusqueda(r, busqueda))
      .sort((a, b) => compararReportes(a, b, orden));
    total = filtrados.length;
    items = filtrados.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
  } else {
    [items, total] = await Promise.all([
      Report.find(q)
        .select('-comentarios')
        .sort(sortSpec)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Report.countDocuments(q),
    ]);
  }

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
