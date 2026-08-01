import { NextResponse } from 'next/server';
import { getSesion } from '@/lib/auth';
import { withErrorHandling } from '@/lib/apiHandler';
export const runtime = 'nodejs';
export const GET = withErrorHandling(async () => {
  const sesion = await getSesion();
  return NextResponse.json({ user: sesion });
});
