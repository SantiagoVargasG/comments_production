'use client';
import { useState } from 'react';
import JSZip from 'jszip';
import { ETIQUETAS_COMBINADAS, ESTADOS, PRIORIDADES, AMBIENTES } from '@/lib/constants';
import { IconDownload } from '@/components/Icons';

const fecha = (d) => (d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

export default function ExportReportsModal({ reportes, modulo, onClose }) {
  const [filtros, setFiltros] = useState({
    tipo: '',
    estado: '',
    ambiente: '',
    prioridad: '',
  });

  function generarMarkdown() {
    const reportesFiltrados = reportes.filter((r) => {
      if (filtros.tipo && r.tipo !== filtros.tipo) return false;
      if (filtros.estado && r.estado !== filtros.estado) return false;
      if (filtros.ambiente && r.ambiente !== filtros.ambiente) return false;
      if (filtros.prioridad && r.prioridad !== filtros.prioridad) return false;
      return true;
    });

    let md = `# Reportes - ${modulo.nombre}\n\n`;
    md += `**Generado:** ${fecha(new Date())}\n`;
    md += `**Total de reportes:** ${reportesFiltrados.length}\n\n`;

    if (filtros.tipo) md += `**Filtro Etiqueta:** ${filtros.tipo}\n`;
    if (filtros.estado) md += `**Filtro Estado:** ${filtros.estado}\n`;
    if (filtros.ambiente) md += `**Filtro Ambiente:** ${filtros.ambiente}\n`;
    if (filtros.prioridad) md += `**Filtro Prioridad:** ${filtros.prioridad}\n`;

    if (Object.values(filtros).some(v => v)) md += '\n---\n\n';

    reportesFiltrados.forEach((r) => {
      md += `## Reporte #${r.consecutivo}\n\n`;
      md += `**Descripción:** ${r.descripcion}\n\n`;
      md += `| Campo | Valor |\n`;
      md += `|-------|-------|\n`;
      md += `| Etiqueta | ${r.tipo || '—'} |\n`;
      md += `| Prioridad | ${r.prioridad || '—'} |\n`;
      md += `| Estado | ${r.estado || 'Sin estado'} |\n`;
      md += `| Ambiente | ${r.ambiente || '—'} |\n`;
      md += `| Versión | ${r.version || '—'} |\n`;
      md += `| Fecha | ${fecha(r.createdAt)} |\n`;
      md += `| Creado por | ${r.creadoPorNombre} (${r.creadoPorRol}) |\n`;
      md += `\n`;

      if (r.comentarios?.length > 0) {
        md += `### Comentarios (${r.comentarios.length})\n\n`;
        r.comentarios.forEach((c) => {
          md += `**${c.autorNombre}** (${c.autorRol}) - ${fecha(c.createdAt)}\n\n`;
          if (c.texto) md += `${c.texto}\n\n`;
        });
      }

      md += `---\n\n`;
    });

    return md;
  }

  function descargarMD() {
    const contenido = generarMarkdown();
    const blob = new Blob([contenido], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reportes-${modulo.slug}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  }

  async function descargarZip() {
    const zip = new JSZip();
    const contenido = generarMarkdown();

    const reportesFiltrados = reportes.filter((r) => {
      if (filtros.tipo && r.tipo !== filtros.tipo) return false;
      if (filtros.estado && r.estado !== filtros.estado) return false;
      if (filtros.ambiente && r.ambiente !== filtros.ambiente) return false;
      if (filtros.prioridad && r.prioridad !== filtros.prioridad) return false;
      return true;
    });

    // Agregar el markdown
    zip.file('reporte.md', contenido);

    // Agregar imágenes en carpeta /images
    const imageFolder = zip.folder('images');
    let imagenCount = 0;

    for (const reporte of reportesFiltrados) {
      // Evidencias del reporte
      if (reporte.evidencias?.length > 0) {
        for (const evidencia of reporte.evidencias) {
          if (evidencia.url) {
            try {
              const response = await fetch(evidencia.url);
              const blob = await response.blob();
              const filename = `reporte-${reporte.consecutivo}-${imagenCount}.${extraerExtension(evidencia.url)}`;
              imageFolder.file(filename, blob);
              imagenCount++;
            } catch (error) {
              console.error(`Error descargando imagen ${evidencia.url}:`, error);
            }
          }
        }
      }

      // Evidencias de comentarios
      if (reporte.comentarios?.length > 0) {
        for (const comentario of reporte.comentarios) {
          if (comentario.evidencias?.length > 0) {
            for (const evidencia of comentario.evidencias) {
              if (evidencia.url) {
                try {
                  const response = await fetch(evidencia.url);
                  const blob = await response.blob();
                  const filename = `reporte-${reporte.consecutivo}-comentario-${imagenCount}.${extraerExtension(evidencia.url)}`;
                  imageFolder.file(filename, blob);
                  imagenCount++;
                } catch (error) {
                  console.error(`Error descargando imagen ${evidencia.url}:`, error);
                }
              }
            }
          }
        }
      }
    }

    // Generar y descargar ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reportes-${modulo.slug}-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  }

  function extraerExtension(url) {
    try {
      const pathname = new URL(url).pathname;
      const match = pathname.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
      return match ? match[1].toLowerCase() : 'jpg';
    } catch {
      return 'jpg';
    }
  }

  const reportesFiltrados = reportes.filter((r) => {
    if (filtros.tipo && r.tipo !== filtros.tipo) return false;
    if (filtros.estado && r.estado !== filtros.estado) return false;
    if (filtros.ambiente && r.ambiente !== filtros.ambiente) return false;
    if (filtros.prioridad && r.prioridad !== filtros.prioridad) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4 z-50" onClick={onClose}>
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Exportar reportes</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="label text-xs">Etiqueta</label>
            <select
              className="input text-sm"
              value={filtros.tipo}
              onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value }))}
            >
              <option value="">Todas</option>
              {ETIQUETAS_COMBINADAS.map((etiq) => <option key={etiq}>{etiq}</option>)}
            </select>
          </div>

          <div>
            <label className="label text-xs">Estado</label>
            <select
              className="input text-sm"
              value={filtros.estado}
              onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value }))}
            >
              <option value="">Todos</option>
              {ESTADOS.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>

          <div>
            <label className="label text-xs">Ambiente</label>
            <select
              className="input text-sm"
              value={filtros.ambiente}
              onChange={(e) => setFiltros((f) => ({ ...f, ambiente: e.target.value }))}
            >
              <option value="">Todos</option>
              {AMBIENTES.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="label text-xs">Prioridad</label>
            <select
              className="input text-sm"
              value={filtros.prioridad}
              onChange={(e) => setFiltros((f) => ({ ...f, prioridad: e.target.value }))}
            >
              <option value="">Todos</option>
              {PRIORIDADES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-ink">{reportesFiltrados.length}</span> reporte{reportesFiltrados.length !== 1 ? 's' : ''} se exportarán
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-ghost flex items-center gap-2" onClick={descargarMD}>
            <IconDownload className="w-4 h-4" /> Solo MD
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={descargarZip}>
            <IconDownload className="w-4 h-4" /> ZIP + Imágenes
          </button>
        </div>
      </div>
    </div>
  );
}
