export default function EvidenceViewer({ evidencias }) {
  if (!evidencias?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {evidencias.map((ev, i) =>
        ev.tipo === 'video' ? (
          <video key={i} src={ev.url} controls className="h-32 rounded-lg border" />
        ) : (
          <a key={i} href={ev.url} target="_blank" rel="noreferrer">
            <img src={ev.url} alt={ev.nombre} className="h-32 w-32 object-cover rounded-lg border hover:opacity-90" />
          </a>
        )
      )}
    </div>
  );
}
