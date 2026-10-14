import Link from 'next/link';
import { MODULO_LIST } from '@/lib/constants';
import { getSesion } from '@/lib/auth';
import { IconBug, IconSupportAgent } from '@/components/Icons';

export const dynamic = 'force-dynamic';

const MODULO_ICON = { loopzii: IconBug, gofixii: IconSupportAgent };

export default async function ModulosPage() {
  const sesion = await getSesion();

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-ink mb-2">Bienvenido, {sesion.nombre}</h1>
        <p className="text-sm text-slate-500">Selecciona un módulo para comenzar</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {MODULO_LIST.map((m) => {
          const Icon = MODULO_ICON[m.slug];
          return (
            <Link
              key={m.slug}
              href={`/modulos/${m.slug}`}
              className="group card p-8 flex flex-col items-center text-center hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                {Icon && <Icon className="w-7 h-7 text-ink" />}
              </div>
              <h2 className="text-lg font-semibold text-ink mb-1">{m.nombre}</h2>
              <p className="text-sm text-slate-500">Módulo {m.numero} · Ver reportes</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
