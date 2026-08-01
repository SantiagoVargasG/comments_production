import { TIPOS, PRIORIDADES, ESTADOS, AMBIENTES } from './constants';

// Reglas de negocio como funciones puras (sin Mongo ni next/headers) para
// poder testearlas directo, sin levantar el runtime de Next.

// Un cliente reporta "en blanco" (sin prioridad/estado/ambiente/versión) a
// propósito, para que tech lo detecte y lo clasifique; tech puede definir
// todo desde la creación.
export function construirCamposPorRol(rol, body) {
  const base = {
    modulo: body.modulo,
    descripcion: (body.descripcion || '').trim(),
    tipo: TIPOS.includes(body.tipo) ? body.tipo : 'Error',
    evidencias: Array.isArray(body.evidencias) ? body.evidencias : [],
  };

  if (rol === 'tech') {
    return {
      ...base,
      prioridad: PRIORIDADES.includes(body.prioridad) ? body.prioridad : null,
      estado: ESTADOS.includes(body.estado) ? body.estado : null,
      ambiente: AMBIENTES.includes(body.ambiente) ? body.ambiente : 'Pendiente',
      version: body.version || '',
    };
  }
  return { ...base, prioridad: null, estado: null, ambiente: 'Pendiente', version: '' };
}

export function puedeEditarReporte(rol) {
  return rol === 'tech';
}

export function puedeEliminarUsuario({ actorId, objetivoId, rolObjetivo, totalTechs }) {
  if (String(actorId) === String(objetivoId)) {
    return { permitido: false, error: 'No puedes eliminar tu propio usuario' };
  }
  if (rolObjetivo === 'tech' && totalTechs <= 1) {
    return { permitido: false, error: 'No puedes eliminar al único usuario tech' };
  }
  return { permitido: true };
}
