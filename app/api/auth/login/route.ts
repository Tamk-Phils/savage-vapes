import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const result = await loginUser(email, password);
    if (!result.success || !result.user || !result.token) {
      return NextResponse.json({ error: result.error || 'Login failed' }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    response.cookies.set('vapewell_auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
