import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('vapewell_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = verifySessionToken(token);
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ user: null, error: err.message });
  }
}

