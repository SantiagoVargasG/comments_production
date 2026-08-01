import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-cambiar');
const COOKIE = 'sesion';

export async function crearSesion(user) {
  const token = await new SignJWT({
    id: user._id.toString(),
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function cerrarSesion() {
  cookies().set(COOKIE, '', { path: '/', maxAge: 0 });
}

export async function getSesion() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

// helper para verificar token en middleware (edge)
export async function verificarToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}
export const COOKIE_NAME = COOKIE;
