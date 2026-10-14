'use client';
import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';

// Sube archivos directo desde el navegador a Vercel Blob (vía /api/upload
// solo para autorizar el token) y devuelve [{url,tipo,nombre}] via onChange.
// Subir directo evita el límite de ~4.5 MB que Vercel impone al body de una
// función serverless normal, necesario para videos.
export default function EvidenceUploader({ evidencias, onChange }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const dropZoneRef = useRef(null);

  async function procesarArchivos(files) {
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
  }

  function subir(e) {
    procesarArchivos(Array.from(e.target.files || []));
    e.target.value = '';
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items || [];
    const files = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length) {
      e.preventDefault();
      procesarArchivos(files);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    procesarArchivos(files);
  }

  function quitar(i) {
    onChange(evidencias.filter((_, idx) => idx !== i));
  }

  return (
    <div onPaste={handlePaste} tabIndex={0}>
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
          isDragging
            ? 'border-ink bg-slate-100'
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
        } ${subiendo ? 'opacity-60' : ''}`}
      >
        <label className="block cursor-pointer">
          <div className="text-xs font-medium text-slate-600 mb-1">
            {subiendo ? 'Subiendo…' : '+ Foto, video o pega aquí'}
          </div>
          <div className="text-xs text-slate-500 mb-2">
            Haz clic, arrastra o pega contenido
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={subir}
            disabled={subiendo}
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {!!evidencias?.length && (
        <div className="flex flex-wrap gap-2 mt-3">
          {evidencias.map((ev, i) => (
            <div key={i} className="relative group">
              {ev.tipo === 'video' ? (
                <video src={ev.url} className="h-20 w-20 object-cover rounded-lg border" />
              ) : (
                <img src={ev.url} alt={ev.nombre} className="h-20 w-20 object-cover rounded-lg border" />
              )}
              <button
                type="button"
                onClick={() => quitar(i)}
                className="absolute -top-2 -right-2 bg-red-600 text-white border border-red-700 rounded-full w-5 h-5 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity font-bold"
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
