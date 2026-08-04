'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Prioridad, Estado, Nuevo } from '@/components/Badge';
import EvidenceViewer from '@/components/EvidenceViewer';
import EvidenceUploader from '@/components/EvidenceUploader';
import { TIPOS, PRIORIDADES, ESTADOS, AMBIENTES, MODULOS } from '@/lib/constants';
import { esReporteNuevo } from '@/lib/reportRules';

const fechaHora = (d) => new Date(d).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function iniciales(nombre) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase();
}

function Meta({ label, value, mono }) {
  return (
    <div>
      <div className="label uppercase">{label}</div>
      <div className={`text-sm text-slate-700 ${mono ? 'font-mono' : ''}`}>{value || '—'}</div>
    </div>
  );
}

export default function ReportDetail({ id, rol, nombre }) {
  const router = useRouter();
  const esTech = rol === 'tech';
  const [r, setR] = useState(null);
  const [editando, setEditando] = useState(false);
  const [edit, setEdit] = useState({});
  const [texto, setTexto] = useState('');
  const [evid, setEvid] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetch(`/api/reports/${id}`);
    if (res.ok) { const data = await res.json(); setR(data); setEdit(data); }
  }, [id]);
  useEffect(() => { cargar(); }, [cargar]);

  async function comentar() {
    if (!texto.trim() && !evid.length) return;
    setEnviando(true);
    const res = await fetch(`/api/reports/${id}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, evidencias: evid }),
    });
    setEnviando(false);
    if (res.ok) { setTexto(''); setEvid([]); cargar(); }
  }

  async function guardarEdicion() {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion: edit.descripcion, tipo: edit.tipo,
        prioridad: edit.prioridad || null, estado: edit.estado || null,
        ambiente: edit.ambiente, version: edit.version,
      }),
    });
    if (res.ok) { setEditando(false); cargar(); }
  }

  async function eliminarReporte() {
    if (!confirm('¿Eliminar este reporte? Esta acción no se puede deshacer.')) return;
    const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    if (res.ok) router.push(`/modulos/${r.modulo}`);
  }

  async function eliminarComentario(commentId) {
    if (!confirm('¿Eliminar este comentario?')) return;
    const res = await fetch(`/api/reports/${id}/comments/${commentId}`, { method: 'DELETE' });
    if (res.ok) cargar();
  }

  if (!r) return <p className="text-slate-400">Cargando…</p>;
  const modulo = MODULOS[r.modulo];

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={`/modulos/${r.modulo}`} className="text-sm text-slate-500 hover:text-ink">← {modulo?.nombre}</Link>

      {/* cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 mb-5">
        <div>
          <div className="text-xs text-slate-400 mb-1">Reporte #{r.consecutivo} · {modulo?.nombre}</div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-lg font-semibold text-ink">Reporte #{r.consecutivo}</h1>
            {!editando && esReporteNuevo(r) && <Nuevo />}
            {!editando && <Prioridad value={r.prioridad} />}
            {!editando && <Estado value={r.estado} />}
          </div>
        </div>
        {esTech && (
          <div className="flex gap-2 shrink-0">
            {editando ? (
              <>
                <button className="btn-ghost" onClick={() => { setEditando(false); setEdit(r); }}>Cancelar</button>
                <button className="btn-primary" onClick={guardarEdicion}>Guardar cambios</button>
              </>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => setEditando(true)}>Editar</button>
                <button className="btn-ghost text-red-600" onClick={eliminarReporte}>Eliminar</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* columna izquierda: metadata, descripción, evidencia */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink mb-4 pb-3 border-b border-slate-100">Metadata</h2>
            {editando ? (
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Tipo"><select className="input" value={edit.tipo || 'Error'} onChange={(e)=>setEdit({...edit,tipo:e.target.value})}>{TIPOS.map(t=><option key={t}>{t}</option>)}</select></Campo>
                <Campo label="Prioridad"><select className="input" value={edit.prioridad || ''} onChange={(e)=>setEdit({...edit,prioridad:e.target.value})}><option value="">Sin definir</option>{PRIORIDADES.map(p=><option key={p}>{p}</option>)}</select></Campo>
                <Campo label="Estado"><select className="input" value={edit.estado || ''} onChange={(e)=>setEdit({...edit,estado:e.target.value})}><option value="">Sin estado</option>{ESTADOS.map(s=><option key={s}>{s}</option>)}</select></Campo>
                <Campo label="Ambiente"><select className="input" value={edit.ambiente || 'Pendiente'} onChange={(e)=>setEdit({...edit,ambiente:e.target.value})}>{AMBIENTES.map(a=><option key={a}>{a}</option>)}</select></Campo>
                <Campo label="Versión desplegada"><input className="input" value={edit.version || ''} onChange={(e)=>setEdit({...edit,version:e.target.value})} placeholder="Android 1.4.2 / iOS 1.4.2" /></Campo>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <Meta label="Tipo" value={r.tipo} />
                <Meta label="Ambiente" value={r.ambiente} />
                <Meta label="Versión afectada" value={r.version} mono />
                <Meta label="Fecha reporte" value={fechaHora(r.createdAt)} />
                <Meta label="Creado por" value={`${r.creadoPorNombre} · ${r.creadoPorRol}`} />
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">Descripción</h2>
            {editando ? (
              <textarea className="input min-h-[120px]" value={edit.descripcion}
                onChange={(e) => setEdit({ ...edit, descripcion: e.target.value })} />
            ) : (
              <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{r.descripcion}</p>
            )}
          </div>

          {!!r.evidencias?.length && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink">Evidencia</h2>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {r.evidencias.length} archivo{r.evidencias.length === 1 ? '' : 's'}
                </span>
              </div>
              <EvidenceViewer evidencias={r.evidencias} />
            </div>
          )}
        </div>

        {/* columna derecha: hilo de comentarios */}
        <div className="lg:col-span-5">
          <div className="card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-ink">Comentarios ({r.comentarios?.length || 0})</h2>
            </div>

            <div className="p-4 space-y-4">
              {!r.comentarios?.length && (
                <p className="text-sm text-slate-400 text-center py-6">Sin comentarios todavía.</p>
              )}
              {r.comentarios?.map((c) => (
                <div key={c._id} className="flex gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${c.autorRol === 'tech' ? 'bg-ink text-white' : 'bg-fuchsia-100 text-fuchsia-700'}`}>
                    {iniciales(c.autorNombre)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">{c.autorNombre}</span>
                        <span className={`badge ${c.autorRol === 'tech' ? 'bg-ink text-white' : 'bg-fuchsia-100 text-fuchsia-700'}`}>{c.autorRol}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-400">{fechaHora(c.createdAt)}</span>
                        {esTech && (
                          <button className="text-xs text-red-600 hover:underline" onClick={() => eliminarComentario(c._id)}>Eliminar</button>
                        )}
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg rounded-tl-none p-3">
                      {c.texto && <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.texto}</p>}
                      <EvidenceViewer evidencias={c.evidencias} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <label className="label">Agregar comentario</label>
              <textarea className="input min-h-[80px] bg-white" value={texto} onChange={(e) => setTexto(e.target.value)}
                placeholder={esTech ? 'Deja evidencia del ajuste o una nota…' : 'Escribe tu comentario…'} />
              <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                <EvidenceUploader evidencias={evid} onChange={setEvid} />
                <button className="btn-primary" onClick={comentar} disabled={enviando}>
                  {enviando ? 'Enviando…' : 'Comentar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return <div><label className="label">{label}</label>{children}</div>;
}
