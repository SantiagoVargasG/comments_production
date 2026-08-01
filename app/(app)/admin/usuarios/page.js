import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/auth';
import UsersAdmin from '@/components/UsersAdmin';
export const dynamic = 'force-dynamic';
export default async function UsuariosPage() {
  const sesion = await getSesion();
  if (sesion.rol !== 'tech') redirect('/modulos');
  return <UsersAdmin />;
}
