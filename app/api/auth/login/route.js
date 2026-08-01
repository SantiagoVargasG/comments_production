import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { crearSesion } from '@/lib/auth';
import { withErrorHandling } from '@/lib/apiHandler';
import { registrarIntento, intentosExcedidos } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export const POST = withErrorHandling(async (req) => {
  const { correo, password } = await req.json();
  if (!correo || !password)
    return NextResponse.json({ error: 'Correo y contraseña son obligatorios' }, { status: 400 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const clave = `${ip}:${correo.toLowerCase().trim()}`;
  if (intentosExcedidos(clave)) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.' }, { status: 429 });
  }

  await dbConnect();
  const user = await User.findOne({ correo: correo.toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    registrarIntento(clave);
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }
  await crearSesion(user);
  return NextResponse.json({ id: user._id, nombre: user.nombre, rol: user.rol });
});
