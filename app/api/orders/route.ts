import { NextRequest, NextResponse } from 'next/server';
import { saveOrder } from '@/lib/products';
import { sendOrderConfirmationEmail, sendAdminOrderAlertEmail } from '@/lib/email';
import { Order } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customerEmail || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required order details' },
        { status: 400 }
      );
    }

    const totalQuantity = (body.items || []).reduce(
      (sum: number, item: any) => sum + (Number(item.quantity) || 0),
      0
    );

    if (totalQuantity < 5) {
      return NextResponse.json(
        { error: `Minimum order requirement is 5 products. Your order contains ${totalQuantity} product(s).` },
        { status: 400 }
      );
    }

    const result = await saveOrder(body);

    if (result.success) {
      const completedOrder: Order = {
        id: result.orderId,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingAddress: body.shippingAddress,
        items: body.items,
        subtotal: Number(body.subtotal) || 0,
        shippingFee: Number(body.shippingFee) || 0,
        total: Number(body.total) || 0,
        paymentMethod: body.paymentMethod || 'standard',
        cardDetails: body.cardDetails,
        orderNotes: body.orderNotes,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Send emails asynchronously
      Promise.allSettled([
        sendOrderConfirmationEmail(completedOrder),
        sendAdminOrderAlertEmail(completedOrder),
      ]).then((results) => {
        results.forEach((r, idx) => {
          if (r.status === 'rejected') {
            console.error(`Email dispatch error (${idx === 0 ? 'customer' : 'admin'}):`, r.reason);
          }
        });
      });

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

