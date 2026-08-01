'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Prioridad, Estado, Ambiente, Tipo, Nuevo } from '@/components/Badge';
import EvidenceViewer from '@/components/EvidenceViewer';
import EvidenceUploader from '@/components/EvidenceUploader';
import { TIPOS, PRIORIDADES, ESTADOS, AMBIENTES, MODULOS } from '@/lib/constants';
import { esReporteNuevo } from '@/lib/reportRules';

const fechaHora = (d) => new Date(d).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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
    <div className="max-w-3xl">
      <Link href={`/modulos/${r.modulo}`} className="text-sm text-slate-500 hover:text-ink">← {modulo?.nombre}</Link>

      {/* cabecera / metadatos */}
      <div className="card p-5 mt-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">Reporte #{r.consecutivo} · {modulo?.nombre}</div>
            {editando ? (
              <textarea className="input mt-2 min-h-[90px]" value={edit.descripcion}
                onChange={(e) => setEdit({ ...edit, descripcion: e.target.value })} />
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-slate-800">{r.descripcion}</p>
            )}
          </div>
          {esTech && !editando && (
            <div className="flex gap-2 shrink-0">
              <button className="btn-ghost" onClick={() => setEditando(true)}>Editar</button>
              <button className="btn-ghost text-red-600" onClick={eliminarReporte}>Eliminar</button>
            </div>
          )}
        </div>

        {editando ? (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Campo label="Tipo"><select className="input" value={edit.tipo || 'Error'} onChange={(e)=>setEdit({...edit,tipo:e.target.value})}>{TIPOS.map(t=><option key={t}>{t}</option>)}</select></Campo>
            <Campo label="Prioridad"><select className="input" value={edit.prioridad || ''} onChange={(e)=>setEdit({...edit,prioridad:e.target.value})}><option value="">Sin definir</option>{PRIORIDADES.map(p=><option key={p}>{p}</option>)}</select></Campo>
            <Campo label="Estado"><select className="input" value={edit.estado || ''} onChange={(e)=>setEdit({...edit,estado:e.target.value})}><option value="">Sin estado</option>{ESTADOS.map(s=><option key={s}>{s}</option>)}</select></Campo>
            <Campo label="Ambiente"><select className="input" value={edit.ambiente || 'Pendiente'} onChange={(e)=>setEdit({...edit,ambiente:e.target.value})}>{AMBIENTES.map(a=><option key={a}>{a}</option>)}</select></Campo>
            <Campo label="Versión desplegada"><input className="input" value={edit.version || ''} onChange={(e)=>setEdit({...edit,version:e.target.value})} placeholder="Android 1.4.2 / iOS 1.4.2" /></Campo>
            <div className="col-span-2 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => { setEditando(false); setEdit(r); }}>Cancelar</button>
              <button className="btn-primary" onClick={guardarEdicion}>Guardar cambios</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mt-4">
            {esReporteNuevo(r) && <Nuevo />}
            <Tipo value={r.tipo} /><Prioridad value={r.prioridad} /><Estado value={r.estado} /><Ambiente value={r.ambiente} />
            {r.version && <span className="badge bg-slate-100 text-slate-600">v: {r.version}</span>}
            <span className="badge bg-slate-100 text-slate-500">Creado por {r.creadoPorNombre} · {r.creadoPorRol}</span>
          </div>
        )}

        {!!r.evidencias?.length && (
          <div className="mt-4">
            <div className="label">Evidencias del reporte</div>
            <EvidenceViewer evidencias={r.evidencias} />
          </div>
        )}
      </div>

      {/* comentarios */}
      <h2 className="text-sm font-semibold text-slate-600 mt-6 mb-2">Comentarios ({r.comentarios?.length || 0})</h2>
      <div className="space-y-3">
        {r.comentarios?.map((c) => (
          <div key={c._id} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{c.autorNombre} <span className={`badge ml-1 ${c.autorRol === 'tech' ? 'bg-ink text-white' : 'bg-fuchsia-100 text-fuchsia-700'}`}>{c.autorRol}</span></span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{fechaHora(c.createdAt)}</span>
                {esTech && (
                  <button className="text-xs text-red-600 hover:underline" onClick={() => eliminarComentario(c._id)}>Eliminar</button>
                )}
              </div>
            </div>
            {c.texto && <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{c.texto}</p>}
            <EvidenceViewer evidencias={c.evidencias} />
          </div>
        ))}
      </div>

      {/* nuevo comentario */}
      <div className="card p-4 mt-4">
        <div className="label">Agregar comentario</div>
        <textarea className="input min-h-[80px]" value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder={esTech ? 'Deja evidencia del ajuste o una nota…' : 'Escribe tu comentario…'} />
        <div className="flex items-center justify-between mt-3">
          <EvidenceUploader evidencias={evid} onChange={setEvid} />
          <button className="btn-primary" onClick={comentar} disabled={enviando}>
            {enviando ? 'Enviando…' : 'Comentar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return <div><label className="label">{label}</label>{children}</div>;
}
