import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { User, Report, Counter, siguienteConsecutivo } from './models';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Report.deleteMany({}), Counter.deleteMany({})]);
});

describe('siguienteConsecutivo', () => {
  it('empieza en 1 y sube de a uno por módulo', async () => {
    expect(await siguienteConsecutivo('loopzii')).toBe(1);
    expect(await siguienteConsecutivo('loopzii')).toBe(2);
    expect(await siguienteConsecutivo('gofixii')).toBe(1); // contador independiente por módulo
  });

  it('no repite consecutivos ante inserciones concurrentes (condición de carrera)', async () => {
    const resultados = await Promise.all(
      Array.from({ length: 20 }, () => siguienteConsecutivo('loopzii'))
    );
    const unicos = new Set(resultados);
    expect(unicos.size).toBe(20);
    expect(Math.max(...resultados)).toBe(20);
  });
});

describe('User', () => {
  it('no permite dos usuarios con el mismo correo', async () => {
    await User.create({ nombre: 'Ana', correo: 'ana@x.com', passwordHash: 'h', rol: 'tech' });
    await expect(
      User.create({ nombre: 'Otra Ana', correo: 'ana@x.com', passwordHash: 'h2', rol: 'cliente' })
    ).rejects.toThrow();
  });
});

describe('Report', () => {
  it('crea un reporte de cliente sin estado/prioridad, como espera la regla de negocio', async () => {
    const report = await Report.create({
      modulo: 'loopzii',
      consecutivo: await siguienteConsecutivo('loopzii'),
      descripcion: 'algo falla',
      creadoPorRol: 'cliente',
      creadoPorNombre: 'Cliente X',
    });
    expect(report.estado).toBeNull();
    expect(report.prioridad).toBeNull();
    expect(report.ambiente).toBe('Pendiente');
  });

  it('rechaza un módulo fuera del enum', async () => {
    await expect(
      Report.create({ modulo: 'no-existe', descripcion: 'x', creadoPorNombre: 'x' })
    ).rejects.toThrow();
  });
});
