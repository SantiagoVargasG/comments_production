import { getSesion } from '@/lib/auth';
import ReportDetail from '@/components/ReportDetail';

export const dynamic = 'force-dynamic';

export default async function ReportePage({ params }) {
  const { id } = await params;
  const sesion = await getSesion();
  return <ReportDetail id={id} rol={sesion.rol} nombre={sesion.nombre} />;
}
