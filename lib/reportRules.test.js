import { describe, it, expect } from 'vitest';
import { construirCamposPorRol, puedeEditarReporte, puedeEliminarUsuario, esReporteNuevo } from './reportRules';

describe('construirCamposPorRol', () => {
  it('cliente: fuerza prioridad/estado nulos y ambiente Pendiente aunque el body traiga otra cosa', () => {
    const campos = construirCamposPorRol('cliente', {
      modulo: 'loopzii',
      descripcion: '  algo falla  ',
      prioridad: 'Alta',
      estado: 'Finalizado',
      ambiente: 'Producción',
      version: '1.2.3',
    });
    expect(campos.prioridad).toBeNull();
    expect(campos.estado).toBeNull();
    expect(campos.ambiente).toBe('Pendiente');
    expect(campos.version).toBe('');
    expect(campos.descripcion).toBe('algo falla');
  });

  it('tech: respeta prioridad/estado/ambiente/version del body si son válidos', () => {
    const campos = construirCamposPorRol('tech', {
      modulo: 'gofixii',
      descripcion: 'ajuste',
      prioridad: 'Alta',
      estado: 'En progreso',
      ambiente: 'Producción',
      version: '1.2.3',
    });
    expect(campos.prioridad).toBe('Alta');
    expect(campos.estado).toBe('En progreso');
    expect(campos.ambiente).toBe('Producción');
    expect(campos.version).toBe('1.2.3');
  });

  it('tech: valores inválidos caen a los defaults en vez de colarse al documento', () => {
    const campos = construirCamposPorRol('tech', {
      modulo: 'loopzii',
      descripcion: 'x',
      prioridad: 'Urgentísima',
      estado: 'Rechazado',
      ambiente: 'Luna',
    });
    expect(campos.prioridad).toBeNull();
    expect(campos.estado).toBeNull();
    expect(campos.ambiente).toBe('Pendiente');
  });
});

describe('puedeEditarReporte', () => {
  it('solo tech puede editar', () => {
    expect(puedeEditarReporte('tech')).toBe(true);
    expect(puedeEditarReporte('cliente')).toBe(false);
    expect(puedeEditarReporte(undefined)).toBe(false);
  });
});

describe('puedeEliminarUsuario', () => {
  it('bloquea que un usuario se elimine a sí mismo', () => {
    const r = puedeEliminarUsuario({ actorId: 'u1', objetivoId: 'u1', rolObjetivo: 'cliente', totalTechs: 2 });
    expect(r.permitido).toBe(false);
  });

  it('bloquea eliminar al único usuario tech', () => {
    const r = puedeEliminarUsuario({ actorId: 'u1', objetivoId: 'u2', rolObjetivo: 'tech', totalTechs: 1 });
    expect(r.permitido).toBe(false);
  });

  it('permite eliminar tech cuando hay más de uno', () => {
    const r = puedeEliminarUsuario({ actorId: 'u1', objetivoId: 'u2', rolObjetivo: 'tech', totalTechs: 2 });
    expect(r.permitido).toBe(true);
  });

  it('permite eliminar a un cliente distinto del actor', () => {
    const r = puedeEliminarUsuario({ actorId: 'u1', objetivoId: 'u2', rolObjetivo: 'cliente', totalTechs: 1 });
    expect(r.permitido).toBe(true);
  });
});

describe('esReporteNuevo', () => {
  it('es nuevo cuando no tiene estado ni prioridad', () => {
    expect(esReporteNuevo({ estado: null, prioridad: null })).toBe(true);
  });

  it('deja de ser nuevo en cuanto se le asigna estado', () => {
    expect(esReporteNuevo({ estado: 'Por hacer', prioridad: null })).toBe(false);
  });

  it('deja de ser nuevo en cuanto se le asigna prioridad', () => {
    expect(esReporteNuevo({ estado: null, prioridad: 'Alta' })).toBe(false);
  });

  it('no es nuevo si ya tiene ambos', () => {
    expect(esReporteNuevo({ estado: 'Finalizado', prioridad: 'Baja' })).toBe(false);
  });
});
