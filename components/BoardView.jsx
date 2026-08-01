'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Prioridad, Ambiente, Tipo } from '@/components/Badge';
import { ESTADOS } from '@/lib/constants';

const COLUMNAS = [
  { key: '', label: 'Sin estado' },
  ...ESTADOS.map((e) => ({ key: e, label: e })),
];

const fecha = (d) => (d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export default function BoardView({ reportes, esTech, onMover }) {
  const [arrastrando, setArrastrando] = useState(null);
  const [sobreColumna, setSobreColumna] = useState(null);

  const columnas = COLUMNAS.map((col) => ({
    ...col,
    items: reportes.filter((r) => (r.estado || '') === col.key),
  }));

  function soltar(e, columnaKey) {
    e.preventDefault();
    setSobreColumna(null);
    const id = e.dataTransfer.getData('text/plain');
    if (id) onMover(id, columnaKey || null);
    setArrastrando(null);
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max">
        {columnas.map((col) => (
          <div
            key={col.key || 'sin-estado'}
            className={`w-72 shrink-0 rounded-xl border ${sobreColumna === col.key ? 'border-ink bg-slate-50' : 'border-slate-200 bg-slate-50/50'}`}
            onDragOver={(e) => { if (esTech) { e.preventDefault(); setSobreColumna(col.key); } }}
            onDragLeave={() => setSobreColumna((c) => (c === col.key ? null : c))}
            onDrop={(e) => esTech && soltar(e, col.key)}
          >
            <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">{col.label}</span>
              <span className="text-xs text-slate-400">{col.items.length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[80px]">
              {col.items.length === 0 ? (
                <p className="text-xs text-slate-300 text-center py-4">Sin reportes</p>
              ) : col.items.map((r) => (
                <div
                  key={r._id}
                  draggable={esTech}
                  onDragStart={(e) => { e.dataTransfer.setData('text/plain', r._id); setArrastrando(r._id); }}
                  onDragEnd={() => setArrastrando(null)}
                  className={`card p-3 text-sm ${esTech ? 'cursor-grab active:cursor-grabbing' : ''} ${arrastrando === r._id ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>#{r.consecutivo}</span>
                    <span>{fecha(r.createdAt)}</span>
                  </div>
                  <p className="line-clamp-3 whitespace-pre-wrap text-slate-700 mb-2">{r.descripcion}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Tipo value={r.tipo} />
                    <Prioridad value={r.prioridad} />
                    <Ambiente value={r.ambiente} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/reportes/${r._id}`} className="text-xs text-slate-600 underline underline-offset-2">
                      Ver detalle
                    </Link>
                    {esTech && (
                      <select
                        className="text-xs border border-slate-200 rounded-md px-1 py-0.5 bg-white"
                        value={r.estado || ''}
                        onChange={(e) => onMover(r._id, e.target.value || null)}
                      >
                        <option value="">Sin estado</option>
                        {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
