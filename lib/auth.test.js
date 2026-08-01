import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';
import { verificarToken } from './auth';

// No probamos crearSesion/getSesion/cerrarSesion aquí porque usan
// next/headers `cookies()`, que requiere el contexto de request de Next
// (App Router) y no está disponible fuera de él. verificarToken es la
// pieza que sí es pura respecto a Next y es la que también usa el
// middleware/proxy para autorizar cada request.

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);

async function firmar(payload, { exp } = {}) {
  let builder = new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt();
  builder = exp ? builder.setExpirationTime(exp) : builder.setExpirationTime('7d');
  return builder.sign(secret());
}

describe('verificarToken', () => {
  it('acepta un token válido firmado con el mismo secreto y devuelve su payload', async () => {
    const token = await firmar({ id: '1', nombre: 'Ana', rol: 'tech' });
    const payload = await verificarToken(token);
    expect(payload).toMatchObject({ id: '1', nombre: 'Ana', rol: 'tech' });
  });

  it('rechaza un token expirado', async () => {
    const token = await firmar({ id: '1', rol: 'tech' }, { exp: '-1s' });
    const payload = await verificarToken(token);
    expect(payload).toBeNull();
  });

  it('rechaza un token firmado con otro secreto', async () => {
    const otro = new TextEncoder().encode('otro-secreto-distinto');
    const token = await new SignJWT({ id: '1', rol: 'tech' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(otro);
    const payload = await verificarToken(token);
    expect(payload).toBeNull();
  });

  it('rechaza basura que no es un JWT', async () => {
    const payload = await verificarToken('no-soy-un-token');
    expect(payload).toBeNull();
  });
});
