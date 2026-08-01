import { NextResponse } from 'next/server';
import { getSesion } from '@/lib/auth';
export const runtime = 'nodejs';
export async function GET() {
  const sesion = await getSesion();
  return NextResponse.json({ user: sesion });
}
