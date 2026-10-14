export const MODULOS = {
  loopzii: { slug: 'loopzii', nombre: 'Loopzii', numero: 1 },
  gofixii: { slug: 'gofixii', nombre: 'GoFixii', numero: 2 },
};
export const MODULO_LIST = Object.values(MODULOS);

export const TIPOS = ['Error', 'Mejora', 'Nuevo requerimiento'];
export const PRIORIDADES = ['Baja', 'Media', 'Alta'];
export const ESTADOS = ['Sin estado', 'Por hacer', 'En desarrollo', 'Pruebas PM', 'Validación cliente', 'En revisión tiendas', 'Finalizado'];
export const AMBIENTES = ['Pendiente', 'Desarrollo', 'Producción'];
export const ETIQUETAS = ['Nuevo', 'En revisión PM', 'Pregunta al cliente', 'Aceptado garantía', 'No aplica garantía', 'Para cotizar'];

// Colores para badges (clases Tailwind)
export const PRIORIDAD_COLOR = {
  Baja: 'bg-slate-100 text-slate-700',
  Media: 'bg-amber-100 text-amber-800',
  Alta: 'bg-red-100 text-red-700',
};
export const ESTADO_COLOR = {
  'Sin estado': 'bg-fuchsia-100 text-fuchsia-700',
  'Por hacer': 'bg-slate-100 text-slate-700',
  'En desarrollo': 'bg-blue-100 text-blue-700',
  'Pruebas PM': 'bg-amber-100 text-amber-800',
  'Validación cliente': 'bg-indigo-100 text-indigo-700',
  'En revisión tiendas': 'bg-orange-100 text-orange-700',
  'Finalizado': 'bg-emerald-100 text-emerald-700',
};
export const AMBIENTE_COLOR = {
  Pendiente: 'bg-fuchsia-100 text-fuchsia-700',
  Desarrollo: 'bg-indigo-100 text-indigo-700',
  'Producción': 'bg-emerald-100 text-emerald-700',
};
export const TIPO_COLOR = {
  Error: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  Mejora: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  'Nuevo requerimiento': 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
};

export const ETIQUETA_COLOR = {
  'Nuevo': 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  'En revisión PM': 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  'Pregunta al cliente': 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
  'Aceptado garantía': 'bg-green-50 text-green-700 ring-1 ring-green-200',
  'No aplica garantía': 'bg-pink-50 text-pink-700 ring-1 ring-pink-200',
  'Para cotizar': 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
};
