import { NextRequest, NextResponse } from 'next/server';
import { getAllThreads, getThreadMessages, sendAdminReply, markThreadRead } from '@/lib/chat';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    if (threadId) {
      const messages = await getThreadMessages(threadId);
      await markThreadRead(threadId, 'admin');
      const allThreads = await getAllThreads();
      const thread = allThreads.find((t) => t.id === threadId);
      return NextResponse.json({ thread, messages });
    }

    const threads = await getAllThreads();
    return NextResponse.json({ threads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { threadId, text, adminName } = body;

    if (!threadId || !text || !text.trim()) {
      return NextResponse.json({ error: 'Thread ID and text are required' }, { status: 400 });
    }

    const result = await sendAdminReply(threadId, text.trim(), adminName || 'Vape Well Support');
    return NextResponse.json({ success: true, message: result.message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

