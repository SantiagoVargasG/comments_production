import { notFound } from 'next/navigation';
import { MODULOS } from '@/lib/constants';
import { getSesion } from '@/lib/auth';
import ModuleView from '@/components/ModuleView';

export const dynamic = 'force-dynamic';

export default async function ModuloPage({ params }) {
  const { modulo: slug } = await params;
  const modulo = MODULOS[slug];
  if (!modulo) notFound();
  const sesion = await getSesion();
  return <ModuleView modulo={modulo} rol={sesion.rol} nombre={sesion.nombre} />;
}
