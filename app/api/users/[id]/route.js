import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { getSesion } from '@/lib/auth';
import { withErrorHandling } from '@/lib/apiHandler';
import { puedeEliminarUsuario } from '@/lib/reportRules';

export const runtime = 'nodejs';

export const PATCH = withErrorHandling(async (req, { params }) => {
  const sesion = await getSesion();
  if (sesion?.rol !== 'tech') return NextResponse.json({ error: 'Solo tech' }, { status: 403 });
  const { id } = await params;
  const { nombre, rol, password } = await req.json();
  await dbConnect();

  const set = {};
  if (typeof nombre === 'string' && nombre.trim()) set.nombre = nombre.trim();
  if (rol === 'tech' || rol === 'cliente') set.rol = rol;
  if (typeof password === 'string' && password.length > 0) set.passwordHash = await bcrypt.hash(password, 10);

  if (set.rol === 'cliente') {
    const totalTechs = await User.countDocuments({ rol: 'tech' });
    const objetivo = await User.findById(id).select('rol').lean();
    if (objetivo?.rol === 'tech' && totalTechs <= 1) {
      return NextResponse.json({ error: 'No puedes quitarle el rol tech al único usuario tech' }, { status: 409 });
    }
  }

  const user = await User.findByIdAndUpdate(id, { $set: set }, { returnDocument: 'after', projection: 'nombre correo rol createdAt' }).lean();
  if (!user) return NextResponse.json({ error: 'No existe' }, { status: 404 });
  return NextResponse.json(user);
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  const sesion = await getSesion();
  if (sesion?.rol !== 'tech') return NextResponse.json({ error: 'Solo tech' }, { status: 403 });
  const { id } = await params;
  await dbConnect();

  const objetivo = await User.findById(id).select('rol').lean();
  if (!objetivo) return NextResponse.json({ error: 'No existe' }, { status: 404 });

  const totalTechs = await User.countDocuments({ rol: 'tech' });
  const { permitido, error } = puedeEliminarUsuario({
    actorId: sesion.id,
    objetivoId: id,
    rolObjetivo: objetivo.rol,
    totalTechs,
  });
  if (!permitido) return NextResponse.json({ error }, { status: 409 });

  await User.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
});
