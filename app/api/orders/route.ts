import { NextRequest, NextResponse } from 'next/server';
import { saveOrder } from '@/lib/products';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customerEmail || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required order details' },
        { status: 400 }
      );
    }

    const result = await saveOrder(body);

    if (result.success) {
      return NextResponse.json({
        success: true,
        orderId: result.orderId,
        message: 'Order placed successfully',
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to process order' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API /api/orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

