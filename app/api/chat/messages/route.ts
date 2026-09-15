import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getOrCreateThread, getThreadMessages, sendUserMessage, markThreadRead } from '@/lib/chat';
import { sendAdminChatAlertEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('vapewell_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to access live chat.' }, { status: 401 });
    }

    const user = verifySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 });
    }

    const thread = await getOrCreateThread(user);
    const messages = await getThreadMessages(thread.id);
    await markThreadRead(thread.id, 'user');

    return NextResponse.json({
      thread,
      messages,
      user,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('vapewell_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to chat.' }, { status: 401 });
    }

    const user = verifySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 });
    }

    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message text cannot be empty' }, { status: 400 });
    }

    const result = await sendUserMessage(user, text.trim());

    // Send admin email alert asynchronously via SpaceMail SMTP
    sendAdminChatAlertEmail({
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      message: text.trim(),
      threadId: result.thread.id,
    }).catch((emailErr) => {
      console.error('SpaceMail admin chat alert error:', emailErr);
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      thread: result.thread,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
