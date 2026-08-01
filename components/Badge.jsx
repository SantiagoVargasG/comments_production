export function Badge({ children, className = '' }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

import {
  PRIORIDAD_COLOR, ESTADO_COLOR, AMBIENTE_COLOR, TIPO_COLOR,
} from '@/lib/constants';

export function Prioridad({ value }) {
  if (!value) return <span className="text-slate-300">—</span>;
  return <Badge className={PRIORIDAD_COLOR[value] || 'bg-slate-100'}>{value}</Badge>;
}
export function Estado({ value }) {
  const label = value || 'Sin estado';
  return <Badge className={ESTADO_COLOR[label] || 'bg-slate-100'}>{label}</Badge>;
}
export function Ambiente({ value }) {
  if (!value) return <span className="text-slate-300">—</span>;
  return <Badge className={AMBIENTE_COLOR[value] || 'bg-slate-100'}>{value}</Badge>;
}
export function Tipo({ value }) {
  if (!value) return <span className="text-slate-300">—</span>;
  return <Badge className={TIPO_COLOR[value] || 'bg-slate-100'}>{value}</Badge>;
}
export function Nuevo() {
  return <Badge className="bg-amber-100 text-amber-800 ring-1 ring-amber-300 font-semibold">Nuevo</Badge>;
}
