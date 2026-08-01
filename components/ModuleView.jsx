'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Prioridad, Estado, Ambiente, Tipo } from '@/components/Badge';
import ReportForm from '@/components/ReportForm';

const fecha = (d) => (d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export default function ModuleView({ modulo, rol, nombre }) {
  const esTech = rol === 'tech';
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [filtros, setFiltros] = useState({ ambiente: '', desde: '', hasta: '' });

  const cargar = useCallback(async () => {
    setCargando(true);
    const p = new URLSearchParams({ modulo: modulo.slug });
    if (filtros.ambiente) p.set('ambiente', filtros.ambiente);
    if (filtros.desde) p.set('desde', filtros.desde);
    if (filtros.hasta) p.set('hasta', filtros.hasta);
    const res = await fetch(`/api/reports?${p.toString()}`);
    setReportes(res.ok ? await res.json() : []);
    setCargando(false);
  }, [modulo.slug, filtros]);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Módulo {modulo.numero}</div>
          <h1 className="text-lg font-semibold">{modulo.nombre}</h1>
        </div>
        <button className="btn-primary" onClick={() => setCreando(true)}>+ Nuevo reporte</button>
      </div>

      {/* filtros */}
      <div className="card p-3 my-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Ambiente</label>
          <select className="input" value={filtros.ambiente}
            onChange={(e) => setFiltros((f) => ({ ...f, ambiente: e.target.value }))}>
            <option value="">Todos</option>
            <option>Pendiente</option>
            <option>Desarrollo</option>
            <option>Producción</option>
          </select>
        </div>
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input" value={filtros.desde}
            onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input" value={filtros.hasta}
            onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))} />
        </div>
        {(filtros.ambiente || filtros.desde || filtros.hasta) && (
          <button className="btn-ghost" onClick={() => setFiltros({ ambiente: '', desde: '', hasta: '' })}>
            Limpiar
          </button>
        )}
        <div className="ml-auto text-sm text-slate-400 self-center">{reportes.length} reportes</div>
      </div>

      {/* tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium min-w-[280px]">Comentario / Reporte</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Prioridad</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium">Ambiente</th>
                <th className="px-3 py-2 font-medium">Versión</th>
                <th className="px-3 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-400">Cargando…</td></tr>
              ) : reportes.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-400">
                  Sin reportes todavía. Crea el primero con “Nuevo reporte”.
                </td></tr>
              ) : reportes.map((r) => (
                <tr key={r._id} className={`align-top hover:bg-slate-50 ${!r.estado ? 'bg-fuchsia-50/40' : ''}`}>
                  <td className="px-3 py-3 text-slate-400">{r.consecutivo}</td>
                  <td className="px-3 py-3 max-w-[420px]">
                    <div className="line-clamp-3 whitespace-pre-wrap text-slate-700">{r.descripcion}</div>
                  </td>
                  <td className="px-3 py-3"><Tipo value={r.tipo} /></td>
                  <td className="px-3 py-3"><Prioridad value={r.prioridad} /></td>
                  <td className="px-3 py-3"><Estado value={r.estado} /></td>
                  <td className="px-3 py-3"><Ambiente value={r.ambiente} /></td>
                  <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{r.version || '—'}</td>
                  <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{fecha(r.createdAt)}</td>
                  <td className="px-3 py-3">
                    <Link href={`/reportes/${r._id}`} className="text-slate-700 underline underline-offset-2 whitespace-nowrap">
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {creando && (
        <ReportForm
          modulo={modulo.slug}
          esTech={esTech}
          onClose={() => setCreando(false)}
          onCreated={() => { setCreando(false); cargar(); }}
        />
      )}
    </div>
  );
}
