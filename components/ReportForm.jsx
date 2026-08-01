'use client';
import { useState } from 'react';
import EvidenceUploader from '@/components/EvidenceUploader';
import { TIPOS, PRIORIDADES, ESTADOS, AMBIENTES } from '@/lib/constants';

// Modal para crear un reporte nuevo. Cliente solo ve tipo/descripción/evidencia.
export default function ReportForm({ modulo, esTech, onClose, onCreated }) {
  const [form, setForm] = useState({
    tipo: 'Error', descripcion: '', prioridad: '', estado: '', ambiente: 'Pendiente', version: '',
  });
  const [evidencias, setEvidencias] = useState([]);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function guardar() {
    if (!form.descripcion.trim()) return setError('Escribe el comentario o reporte.');
    setError(''); setGuardando(true);
    const payload = { modulo, tipo: form.tipo, descripcion: form.descripcion, evidencias };
    if (esTech) {
      payload.prioridad = form.prioridad || null;
      payload.estado = form.estado || null;
      payload.ambiente = form.ambiente;
      payload.version = form.version;
    }
    const res = await fetch('/api/reports', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    setGuardando(false);
    if (!res.ok) { const d = await res.json(); return setError(d.error || 'No se pudo crear'); }
    onCreated();
  }

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4 z-50" onClick={onClose}>
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Nuevo reporte</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.tipo} onChange={set('tipo')}>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Comentario / Reporte</label>
            <textarea className="input min-h-[100px]" value={form.descripcion} onChange={set('descripcion')}
              placeholder="Describe el error, mejora o requerimiento…" />
          </div>

          {esTech && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prioridad</label>
                <select className="input" value={form.prioridad} onChange={set('prioridad')}>
                  <option value="">Sin definir</option>
                  {PRIORIDADES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Estado</label>
                <select className="input" value={form.estado} onChange={set('estado')}>
                  <option value="">Sin estado</option>
                  {ESTADOS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Ambiente</label>
                <select className="input" value={form.ambiente} onChange={set('ambiente')}>
                  {AMBIENTES.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Versión desplegada</label>
                <input className="input" value={form.version} onChange={set('version')}
                  placeholder="Android 1.4.2 / iOS 1.4.2" />
              </div>
            </div>
          )}

          {!esTech && (
            <p className="text-xs text-slate-500 bg-fuchsia-50 border border-fuchsia-100 rounded-lg p-2">
              Tu reporte quedará sin estado hasta que el equipo tech lo revise.
            </p>
          )}

          <div>
            <label className="label">Evidencias</label>
            <EvidenceUploader evidencias={evidencias} onChange={setEvidencias} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Crear reporte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
