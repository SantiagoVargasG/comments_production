import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function AppLayout({ children }) {
  const sesion = await getSesion();
  if (!sesion) redirect('/login');
  const esTech = sesion.rol === 'tech';

  return (
    <div className="min-h-screen bg-panel">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/modulos" className="font-semibold">Comentarios de producción</Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm text-slate-600">
              <Link href="/modulos/loopzii" className="hover:text-ink">Loopzii</Link>
              <Link href="/modulos/gofixii" className="hover:text-ink">GoFixii</Link>
              {esTech && <Link href="/admin/usuarios" className="hover:text-ink">Usuarios</Link>}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {sesion.nombre} · <span className="font-medium text-slate-700">{esTech ? 'Tech' : 'Cliente'}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
