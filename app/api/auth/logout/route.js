import { NextResponse } from 'next/server';
import { cerrarSesion } from '@/lib/auth';
import { withErrorHandling } from '@/lib/apiHandler';
export const runtime = 'nodejs';
export const POST = withErrorHandling(async () => {
  await cerrarSesion();
  return NextResponse.json({ ok: true });
});
