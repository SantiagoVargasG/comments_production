import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { getSesion } from '@/lib/auth';
import { withErrorHandling } from '@/lib/apiHandler';

export const runtime = 'nodejs';

export const GET = withErrorHandling(async () => {
  const sesion = await getSesion();
  if (sesion?.rol !== 'tech') return NextResponse.json({ error: 'Solo tech' }, { status: 403 });
  await dbConnect();
  const users = await User.find({}, 'nombre correo rol createdAt').sort({ createdAt: -1 }).lean();
  return NextResponse.json(users);
});

export const POST = withErrorHandling(async (req) => {
  const sesion = await getSesion();
  if (sesion?.rol !== 'tech') return NextResponse.json({ error: 'Solo tech puede registrar usuarios' }, { status: 403 });
  const { nombre, correo, password, rol } = await req.json();
  if (!nombre || !correo || !password)
    return NextResponse.json({ error: 'Nombre, correo y contraseña son obligatorios' }, { status: 400 });
  await dbConnect();
  const existe = await User.findOne({ correo: correo.toLowerCase().trim() });
  if (existe) return NextResponse.json({ error: 'Ese correo ya está registrado' }, { status: 409 });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    nombre: nombre.trim(),
    correo: correo.toLowerCase().trim(),
    passwordHash,
    rol: rol === 'tech' ? 'tech' : 'cliente',
  });
  return NextResponse.json({ id: user._id, nombre: user.nombre, correo: user.correo, rol: user.rol });
});
