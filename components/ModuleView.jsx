'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Prioridad, Nuevo } from '@/components/Badge';
import ReportForm from '@/components/ReportForm';
import BoardView from '@/components/BoardView';
import {
  IconSearch, IconTable, IconKanban, IconChevronRight, IconChevronLeft,
  IconBug, IconPalette, IconLightbulb, IconArrowUp, IconArrowDown, IconArrowUpDown,
} from '@/components/Icons';
import { TIPOS } from '@/lib/constants';
import { esReporteNuevo } from '@/lib/reportRules';

const fecha = (d) => (d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const TIPO_ICON = { Error: IconBug, Mejora: IconPalette, 'Nuevo requerimiento': IconLightbulb };
const TIPO_TEXT_COLOR = { Error: 'text-red-600', Mejora: 'text-sky-600', 'Nuevo requerimiento': 'text-violet-600' };
const ESTADO_DOT = { 'Por hacer': 'bg-slate-400', 'En progreso': 'bg-blue-500', 'Finalizado': 'bg-emerald-500' };

function paginasVisibles(pagina, totalPaginas) {
  const set = new Set([1, totalPaginas, pagina - 1, pagina, pagina + 1]);
  return [...set].filter((p) => p >= 1 && p <= totalPaginas).sort((a, b) => a - b);
}

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <span>Módulo {modulo.numero}</span>
            <IconChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">{modulo.nombre}</span>
          </div>
          <h1 className="text-lg font-semibold">Reportes de producción</h1>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 rounded-md border border-slate-200 p-0.5 text-sm">
            <button
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${vista === 'tabla' ? 'bg-white text-ink shadow-sm font-semibold' : 'text-slate-500 hover:text-ink'}`}
              onClick={() => setVista('tabla')}
            >
              <IconTable className="w-4 h-4" /> Tabla
            </button>
            <button
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${vista === 'tablero' ? 'bg-white text-ink shadow-sm font-semibold' : 'text-slate-500 hover:text-ink'}`}
              onClick={() => setVista('tablero')}
            >
              <IconKanban className="w-4 h-4" /> Tablero
            </button>
          </div>
          <button className="btn-primary ml-auto md:ml-0" onClick={() => setCreando(true)}>+ Nuevo reporte</button>
        </div>
      </div>

      {/* filtros */}
      <div className="card shadow-sm p-4 my-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="label">Buscar (# o descripción)</label>
          <div className="relative">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" className="input !pl-9" placeholder="Ej: 42 o pantalla negra" value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)} />
          </div>
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
        <div className="card shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-xs tracking-wide w-20">
                    <button
                      type="button"
                      className="group inline-flex items-center gap-1 hover:text-ink normal-case"
                      onClick={toggleOrden}
                      title="Ordenar por #"
                    >
                      #
                      {orden === 'consecutivo_asc' ? (
                        <IconArrowUp className="w-3.5 h-3.5" />
                      ) : orden === 'consecutivo_desc' ? (
                        <IconArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <IconArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs tracking-wide min-w-[280px]">Comentario / Reporte</th>
                  <th className="px-4 py-3 font-semibold text-xs tracking-wide w-32">Tipo</th>
                  <th className="px-4 py-3 font-semibold text-xs tracking-wide w-28">Prioridad</th>
                  <th className="px-4 py-3 font-semibold text-xs tracking-wide w-32">Estado</th>
                  <th className="px-4 py-3 font-semibold text-xs tracking-wide w-28">Ambiente</th>
                  <th className="px-4 py-3 font-semibold text-xs tracking-wide w-24">Versión</th>
                  <th className="px-4 py-3 font-semibold text-xs tracking-wide w-28">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-xs tracking-wide w-24 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cargando ? (
                  <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-400">Cargando…</td></tr>
                ) : reportes.length === 0 ? (
                  <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-400">
                    Sin reportes todavía. Crea el primero con “Nuevo reporte”.
                  </td></tr>
                ) : reportes.map((r) => {
                  const finalizado = r.estado === 'Finalizado' && r.ambiente === 'Producción';
                  const TipoIcon = TIPO_ICON[r.tipo];
                  return (
                    <tr key={r._id} className={`align-top hover:bg-slate-50 transition-colors group ${!r.estado ? 'bg-fuchsia-50/40' : ''} ${finalizado ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 font-mono text-slate-500">{r.consecutivo}</td>
                      <td className="px-4 py-3 max-w-[420px]">
                        <div className="flex items-start gap-2">
                          {esReporteNuevo(r) && <span className="mt-0.5 shrink-0"><Nuevo /></span>}
                          <div className={`line-clamp-3 whitespace-pre-wrap font-medium text-slate-800 ${finalizado ? 'line-through' : ''}`}>{r.descripcion}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.tipo ? (
                          <span className={`inline-flex items-center gap-1 ${TIPO_TEXT_COLOR[r.tipo] || 'text-slate-500'}`}>
                            {TipoIcon && <TipoIcon className="w-3.5 h-3.5" />} {r.tipo}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3"><Prioridad value={r.prioridad} /></td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${ESTADO_DOT[r.estado] || 'bg-fuchsia-400'}`} />
                          {r.estado || 'Sin estado'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{r.ambiente || '—'}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{r.version || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fecha(r.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/reportes/${r._id}`} className="text-ink hover:underline text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {reportes.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-white">
              <span className="text-xs text-slate-500">Mostrando {reportes.length} de {total} resultados</span>
              {totalPaginas > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                    disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)} aria-label="Página anterior"
                  >
                    <IconChevronLeft className="w-4 h-4" />
                  </button>
                  {(() => {
                    const pags = paginasVisibles(pagina, totalPaginas);
                    const nodes = [];
                    let prev = 0;
                    for (const p of pags) {
                      if (prev && p - prev > 1) {
                        nodes.push(<span key={`e${p}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>);
                      }
                      nodes.push(
                        <button
                          key={p}
                          onClick={() => setPagina(p)}
                          className={`w-8 h-8 flex items-center justify-center rounded text-sm ${p === pagina ? 'bg-ink text-white font-semibold' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          {p}
                        </button>
                      );
                      prev = p;
                    }
                    return nodes;
                  })()}
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                    disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)} aria-label="Página siguiente"
                  >
                    <IconChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : cargando ? (
        <p className="text-slate-400 py-10 text-center">Cargando…</p>
      ) : (
        <BoardView reportes={reportes} esTech={esTech} onMover={moverEstado} />
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
