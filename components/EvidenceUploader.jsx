'use client';
import { useState } from 'react';
import { upload } from '@vercel/blob/client';

// Sube archivos directo desde el navegador a Vercel Blob (vía /api/upload
// solo para autorizar el token) y devuelve [{url,tipo,nombre}] via onChange.
// Subir directo evita el límite de ~4.5 MB que Vercel impone al body de una
// función serverless normal, necesario para videos.
export default function EvidenceUploader({ evidencias, onChange }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  async function subir(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError('');
    setSubiendo(true);
    const nuevas = [];
    try {
      for (const file of files) {
        const esVideo = file.type.startsWith('video/');
        const esImagen = file.type.startsWith('image/');
        if (!esVideo && !esImagen) {
          setError('Solo se permiten imágenes o videos');
          continue;
        }
        const blob = await upload(`evidencias/${Date.now()}-${file.name}`, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          clientPayload: file.type,
        });
        nuevas.push({ url: blob.url, tipo: esVideo ? 'video' : 'imagen', nombre: file.name });
      }
    } catch (err) {
      setError(err.message || 'Error al subir');
    } finally {
      setSubiendo(false);
    }
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
