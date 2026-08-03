'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Prioridad, Estado, Ambiente, Tipo, Nuevo } from '@/components/Badge';
import ReportForm from '@/components/ReportForm';
import BoardView from '@/components/BoardView';
import { TIPOS } from '@/lib/constants';
import { esReporteNuevo } from '@/lib/reportRules';

const fecha = (d) => (d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const PAGE_SIZE = 20;
// El tablero trae todos los reportes que hagan match con los filtros de una
// sola vez (se agrupan en columnas por estado, no tiene paginación propia).
const BOARD_LIMIT = 300;

export default function ModuleView({ modulo, rol, nombre }) {
  const esTech = rol === 'tech';
  const [vista, setVista] = useState('tabla');
  const [reportes, setReportes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [filtros, setFiltros] = useState({ ambiente: '', tipo: '', desde: '', hasta: '', busqueda: '' });
  const [busquedaInput, setBusquedaInput] = useState('');
  const [orden, setOrden] = useState(null); // null = por defecto (recientes); 'consecutivo_asc' | 'consecutivo_desc'

  const cargar = useCallback(async () => {
    setCargando(true);
    const esTablero = vista === 'tablero';
    const p = new URLSearchParams({
      modulo: modulo.slug,
      page: String(esTablero ? 1 : pagina),
      limit: String(esTablero ? BOARD_LIMIT : PAGE_SIZE),
    });
    if (filtros.ambiente) p.set('ambiente', filtros.ambiente);
    if (filtros.tipo) p.set('tipo', filtros.tipo);
    if (filtros.desde) p.set('desde', filtros.desde);
    if (filtros.hasta) p.set('hasta', filtros.hasta);
    if (filtros.busqueda) p.set('busqueda', filtros.busqueda);
    if (orden) p.set('orden', orden);
    const res = await fetch(`/api/reports?${p.toString()}`);
    const data = res.ok ? await res.json() : { items: [], total: 0 };
    setReportes(data.items);
    setTotal(data.total);
    setCargando(false);
  }, [modulo.slug, filtros, pagina, vista, orden]);

  useEffect(() => { setPagina(1); }, [filtros, orden]);
  useEffect(() => { cargar(); }, [cargar]);

  function toggleOrden() {
    setOrden((o) => (o === 'consecutivo_asc' ? 'consecutivo_desc' : 'consecutivo_asc'));
  }

  // Debounce: espera a que la persona deje de escribir antes de disparar
  // la búsqueda, en vez de una petición por cada tecla.
  useEffect(() => {
    const t = setTimeout(() => {
      setFiltros((f) => ({ ...f, busqueda: busquedaInput.trim() }));
    }, 300);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  async function moverEstado(id, nuevoEstado) {
    setReportes((rs) => rs.map((r) => (r._id === id ? { ...r, estado: nuevoEstado } : r)));
    const res = await fetch(`/api/reports/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (!res.ok) cargar(); // revierte trayendo el estado real si falló
  }

  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Módulo {modulo.numero}</div>
          <h1 className="text-lg font-semibold">{modulo.nombre}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-sm">
            <button
              className={`px-3 py-1.5 ${vista === 'tabla' ? 'bg-ink text-white' : 'bg-white text-slate-600'}`}
              onClick={() => setVista('tabla')}
            >
              Tabla
            </button>
            <button
              className={`px-3 py-1.5 ${vista === 'tablero' ? 'bg-ink text-white' : 'bg-white text-slate-600'}`}
              onClick={() => setVista('tablero')}
            >
              Tablero
            </button>
          </div>
          <button className="btn-primary" onClick={() => setCreando(true)}>+ Nuevo reporte</button>
        </div>
      </div>

      {/* filtros */}
      <div className="card p-3 my-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Buscar (# o descripción)</label>
          <input type="text" className="input" placeholder="Ej: 42 o pantalla negra" value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)} />
        </div>
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
          <label className="label">Tipo</label>
          <select className="input" value={filtros.tipo}
            onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value }))}>
            <option value="">Todos</option>
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
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
        {(filtros.ambiente || filtros.tipo || filtros.desde || filtros.hasta || busquedaInput || orden) && (
          <button className="btn-ghost" onClick={() => {
            setBusquedaInput('');
            setFiltros({ ambiente: '', tipo: '', desde: '', hasta: '', busqueda: '' });
            setOrden(null);
          }}>
            Limpiar
          </button>
        )}
        <div className="ml-auto text-sm text-slate-400 self-center">{total} reportes</div>
      </div>

      {vista === 'tabla' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-ink"
                      onClick={toggleOrden}
                      title="Ordenar por #"
                    >
                      # <span className="text-slate-400">{orden === 'consecutivo_asc' ? '↑' : orden === 'consecutivo_desc' ? '↓' : '↕'}</span>
                    </button>
                  </th>
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
                      {esReporteNuevo(r) && <Nuevo />}
                      <div className="line-clamp-3 whitespace-pre-wrap text-slate-700 mt-1">{r.descripcion}</div>
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
      ) : cargando ? (
        <p className="text-slate-400 py-10 text-center">Cargando…</p>
      ) : (
        <BoardView reportes={reportes} esTech={esTech} onMover={moverEstado} />
      )}

      {vista === 'tabla' && totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 text-sm">
          <button className="btn-ghost" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
            ← Anterior
          </button>
          <span className="text-slate-500">Página {pagina} de {totalPaginas}</span>
          <button className="btn-ghost" disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)}>
            Siguiente →
          </button>
        </div>
      )}

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
