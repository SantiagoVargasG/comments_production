export const MODULOS = {
  loopzii: { slug: 'loopzii', nombre: 'Loopzii', numero: 1 },
  gofixii: { slug: 'gofixii', nombre: 'GoFixii', numero: 2 },
};
export const MODULO_LIST = Object.values(MODULOS);

export const TIPOS = ['Error', 'Mejora', 'Nuevo requerimiento'];
export const PRIORIDADES = ['Baja', 'Media', 'Alta'];
export const ESTADOS = ['Por hacer', 'En progreso', 'Finalizado'];
export const AMBIENTES = ['Pendiente', 'Desarrollo', 'Producción'];

// Colores para badges (clases Tailwind)
export const PRIORIDAD_COLOR = {
  Baja: 'bg-slate-100 text-slate-700',
  Media: 'bg-amber-100 text-amber-800',
  Alta: 'bg-red-100 text-red-700',
};
export const ESTADO_COLOR = {
  'Por hacer': 'bg-slate-100 text-slate-700',
  'En progreso': 'bg-blue-100 text-blue-700',
  'Finalizado': 'bg-emerald-100 text-emerald-700',
  'Sin estado': 'bg-fuchsia-100 text-fuchsia-700',
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
