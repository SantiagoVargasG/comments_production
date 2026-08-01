import Link from 'next/link';
import { MODULO_LIST } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default function ModulosPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold mb-1">Módulos</h1>
      <p className="text-sm text-slate-500 mb-6">Selecciona un producto para ver sus reportes.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {MODULO_LIST.map((m) => (
          <Link key={m.slug} href={`/modulos/${m.slug}`} className="card p-6 hover:shadow-sm transition">
            <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Módulo {m.numero}</div>
            <div className="text-xl font-semibold mt-1">{m.nombre}</div>
            <div className="text-sm text-slate-500 mt-2">Ver tabla de reportes →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
