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

// "Nuevo": todavía sin triage de tech (ni estado ni prioridad asignados).
// Deja de serlo en cuanto se le asigna cualquiera de los dos.
export function esReporteNuevo(report) {
  return !report.estado && !report.prioridad;
}

// Quita espacios al inicio/final, tildes y diferencias de mayúsculas para
// que la búsqueda sea flexible (coincide con "café", "CAFE", " cafe ", etc.)
export function normalizarTexto(texto) {
  return (texto ?? '')
    .toString()
    .trim()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase();
}

// Búsqueda por # (consecutivo) o descripción, coincidencia parcial en
// cualquier posición (sirve para palabras a medias mientras se escribe).
export function coincideBusqueda(report, termino) {
  const q = normalizarTexto(termino);
  if (!q) return true;
  const descripcion = normalizarTexto(report.descripcion);
  const consecutivo = String(report.consecutivo ?? '');
  return descripcion.includes(q) || consecutivo.includes(q);
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
