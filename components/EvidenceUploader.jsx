'use client';
import { useState } from 'react';

// Sube archivos a /api/upload y devuelve [{url,tipo,nombre}] via onChange
export default function EvidenceUploader({ evidencias, onChange }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  async function subir(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError('');
    setSubiendo(true);
    const nuevas = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) nuevas.push(await res.json());
      else { const d = await res.json(); setError(d.error || 'Error al subir'); }
    }
    setSubiendo(false);
    onChange([...(evidencias || []), ...nuevas]);
    e.target.value = '';
  }

  function quitar(i) {
    onChange(evidencias.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <label className="btn-ghost cursor-pointer text-sm">
        {subiendo ? 'Subiendo…' : '+ Adjuntar foto o video'}
        <input type="file" accept="image/*,video/*" multiple hidden onChange={subir} disabled={subiendo} />
      </label>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {!!evidencias?.length && (
        <div className="flex flex-wrap gap-2 mt-3">
          {evidencias.map((ev, i) => (
            <div key={i} className="relative">
              {ev.tipo === 'video' ? (
                <video src={ev.url} className="h-20 w-20 object-cover rounded-lg border" />
              ) : (
                <img src={ev.url} alt={ev.nombre} className="h-20 w-20 object-cover rounded-lg border" />
              )}
              <button
                type="button"
                onClick={() => quitar(i)}
                className="absolute -top-2 -right-2 bg-white border rounded-full w-5 h-5 text-xs leading-none"
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
