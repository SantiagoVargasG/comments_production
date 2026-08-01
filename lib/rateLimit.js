// Limitador de intentos de login en memoria (ventana deslizante simple).
// Limitación conocida: en un despliegue serverless con varias instancias
// (Vercel) este contador no es global — cada instancia fría tiene el suyo.
// Suficiente para frenar fuerza bruta casual en una app interna; si el
// tráfico crece y se necesita un límite realmente distribuido, migrar a
// un store compartido (ej. Upstash Redis).
const VENTANA_MS = 60_000;
const MAX_INTENTOS = 5;

const intentos = new Map();

export function intentosExcedidos(clave) {
  limpiar(clave);
  const lista = intentos.get(clave) || [];
  return lista.length >= MAX_INTENTOS;
}

export function registrarIntento(clave) {
  limpiar(clave);
  const lista = intentos.get(clave) || [];
  lista.push(Date.now());
  intentos.set(clave, lista);
}

function limpiar(clave) {
  const ahora = Date.now();
  const lista = (intentos.get(clave) || []).filter((t) => ahora - t < VENTANA_MS);
  intentos.set(clave, lista);
}
