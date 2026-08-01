import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { crearSesion } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req) {
  const { correo, password } = await req.json();
  if (!correo || !password)
    return NextResponse.json({ error: 'Correo y contraseña son obligatorios' }, { status: 400 });
  await dbConnect();
  const user = await User.findOne({ correo: correo.toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  await crearSesion(user);
  return NextResponse.json({ id: user._id, nombre: user.nombre, rol: user.rol });
}
