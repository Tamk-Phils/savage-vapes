import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/admin';

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

