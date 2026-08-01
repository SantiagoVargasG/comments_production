import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

if (!process.env.JWT_SECRET) {
  throw new Error('Falta la variable JWT_SECRET (genera una con: openssl rand -base64 32)');
}
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);
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
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function cerrarSesion() {
  const store = await cookies();
  store.set(COOKIE, '', { path: '/', maxAge: 0 });
}

export async function getSesion() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
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
