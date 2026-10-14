import { useCallback } from 'react';
import { upload } from '@vercel/blob/client';

// Hook para manejar paste de imágenes/videos en cualquier elemento
export function usePasteHandler(onEvidenciasAdded) {
  const handlePaste = useCallback(async (e) => {
    const items = e.clipboardData?.items || [];
    const files = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
          files.push(file);
        }
      }
    }

    if (files.length) {
      e.preventDefault();
      await procesarArchivos(files, onEvidenciasAdded);
    }
  }, [onEvidenciasAdded]);

  return handlePaste;
}

async function procesarArchivos(files, onEvidenciasAdded) {
  const nuevas = [];
  try {
    for (const file of files) {
      const esVideo = file.type.startsWith('video/');
      const blob = await upload(`evidencias/${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: file.type,
      });
      nuevas.push({
        url: blob.url,
        tipo: esVideo ? 'video' : 'imagen',
        nombre: file.name
      });
    }
    if (onEvidenciasAdded) {
      onEvidenciasAdded(nuevas);
    }
  } catch (err) {
    console.error('Error al subir evidencia:', err.message || err);
  }
}
