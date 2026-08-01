import { describe, it, expect, beforeEach, vi } from 'vitest';
import { intentosExcedidos, registrarIntento } from './rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('no bloquea antes de llegar al máximo de intentos', () => {
    const clave = `ip1:correo${Math.random()}@x.com`;
    for (let i = 0; i < 4; i++) registrarIntento(clave);
    expect(intentosExcedidos(clave)).toBe(false);
  });

  it('bloquea al llegar al máximo de intentos dentro de la ventana', () => {
    const clave = `ip2:correo${Math.random()}@x.com`;
    for (let i = 0; i < 5; i++) registrarIntento(clave);
    expect(intentosExcedidos(clave)).toBe(true);
  });

  it('deja de bloquear una vez que la ventana expira', () => {
    const clave = `ip3:correo${Math.random()}@x.com`;
    vi.useFakeTimers();
    vi.setSystemTime(0);
    for (let i = 0; i < 5; i++) registrarIntento(clave);
    expect(intentosExcedidos(clave)).toBe(true);

    vi.setSystemTime(61_000); // pasó la ventana de 60s
    expect(intentosExcedidos(clave)).toBe(false);
  });

  it('claves distintas (IP+correo) no se pisan entre sí', () => {
    const claveA = `ipA:${Math.random()}@x.com`;
    const claveB = `ipB:${Math.random()}@x.com`;
    for (let i = 0; i < 5; i++) registrarIntento(claveA);
    expect(intentosExcedidos(claveA)).toBe(true);
    expect(intentosExcedidos(claveB)).toBe(false);
  });
});
