import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Report } from '@/lib/models';
import { getSesion } from '@/lib/auth';
import { withErrorHandling } from '@/lib/apiHandler';
import { puedeEditarReporte } from '@/lib/reportRules';

export const runtime = 'nodejs';

export const DELETE = withErrorHandling(async (_req, { params }) => {
  const sesion = await getSesion();
  if (!puedeEditarReporte(sesion?.rol))
    return NextResponse.json({ error: 'Solo el equipo tech puede eliminar comentarios' }, { status: 403 });
  const { id, commentId } = await params;
  await dbConnect();
  const report = await Report.findByIdAndUpdate(
    id,
    { $pull: { comentarios: { _id: commentId } } },
    { returnDocument: 'after' }
  ).lean();
  if (!report) return NextResponse.json({ error: 'No existe' }, { status: 404 });
  return NextResponse.json({ ok: true });
});
