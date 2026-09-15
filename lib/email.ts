import nodemailer from 'nodemailer';
import { Order } from '@/types';

// SpaceMail SMTP Configuration
const SMTP_HOST = process.env.SMTP_HOST || 'mail.spacemail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';
const SMTP_SECURE = process.env.SMTP_SECURE === 'false' ? false : (SMTP_PORT === 465 || !process.env.SMTP_PORT);

// Admin notification recipient
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || SMTP_USER || 'admin@vapewellaustralia.com.au';
const SMTP_FROM = process.env.SMTP_FROM || (SMTP_USER ? `"Vape Well Australia" <${SMTP_USER}>` : '"Vape Well Australia" <orders@vapewellaustralia.com.au>');

function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed/proxy cert drops
    },
  });
}

/**
 * Send customer order confirmation receipt
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('⚠️ SpaceMail SMTP not configured: Missing SMTP_USER or SMTP_PASS in environment.');
    return { success: false, error: 'SMTP credentials not configured' };
  }

  const itemsRows = (order.items || []).map((item) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 8px;">
        <div style="font-weight: 600; color: #1e293b; font-size: 14px;">${item.productName}</div>
        ${item.selectedFlavor ? `<div style="font-size: 12px; color: #0d9488; margin-top: 2px;">Flavor: ${item.selectedFlavor}</div>` : ''}
      </td>
      <td style="padding: 12px 8px; text-align: center; color: #64748b; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: #0f172a; font-size: 14px;">$${(item.price * item.quantity).toFixed(2)} AUD</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ${order.id}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 24px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">Vape Well Australia</div>
            <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">Australia's Premier Online Vape Store</div>
          </div>

          <div style="padding: 32px 24px;">
            <!-- Status Badge -->
            <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
              <div style="color: #0f766e; font-weight: 700; font-size: 16px;">Order Confirmed: ${order.id}</div>
              <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Thank you for your order, ${order.customerName}! We are preparing your discreet parcel for dispatch.</div>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b;">
                  <th style="padding: 8px;">Product</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 12px 8px 4px; text-align: right; color: #64748b; font-size: 13px;">Subtotal:</td>
                  <td style="padding: 12px 8px 4px; text-align: right; font-weight: 600; color: #334155; font-size: 14px;">$${order.subtotal.toFixed(2)} AUD</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 4px 8px; text-align: right; color: #64748b; font-size: 13px;">Discreet AU Shipping:</td>
                  <td style="padding: 4px 8px; text-align: right; font-weight: 600; color: #334155; font-size: 14px;">$${order.shippingFee.toFixed(2)} AUD</td>
                </tr>
                <tr style="border-top: 2px solid #e2e8f0;">
                  <td colspan="2" style="padding: 12px 8px; text-align: right; font-weight: 700; color: #0f172a; font-size: 16px;">Total Paid / Due:</td>
                  <td style="padding: 12px 8px; text-align: right; font-weight: 800; color: #0d9488; font-size: 18px;">$${order.total.toFixed(2)} AUD</td>
                </tr>
              </tfoot>
            </table>

            <!-- Shipping & Payment Details -->
            <div style="display: grid; grid-template-columns: 1fr; gap: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <div>
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Delivery Address (Plain Packaging):</div>
                <div style="font-size: 14px; color: #1e293b; line-height: 1.5;">
                  ${order.shippingAddress?.fullName || order.customerName}<br>
                  ${order.shippingAddress?.addressLine1}<br>
                  ${order.shippingAddress?.addressLine2 ? `${order.shippingAddress.addressLine2}<br>` : ''}
                  ${order.shippingAddress?.suburb}, ${order.shippingAddress?.state} ${order.shippingAddress?.postcode}<br>
                  Australia
                </div>
              </div>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Payment Method:</div>
                <div style="font-size: 14px; font-weight: 600; color: #0f172a; text-transform: uppercase;">${order.paymentMethod}</div>
              </div>
            </div>

            <!-- Need Assistance Prompt -->
            <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px;">
              <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">
                Have questions or need immediate verification? Contact our administrator directly:
              </p>
              <a href="mailto:${ADMIN_EMAIL}?subject=Order%20${order.id}%20Inquiry" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px;">
                Email Store Admin (${ADMIN_EMAIL})
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            © ${new Date().getFullYear()} Vape Well Australia. Strictly for adults aged 18+ only.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: order.customerEmail,
      subject: `Order Confirmation #${order.id} - Vape Well Australia`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Failed to send customer confirmation email:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send admin instant order alert
 */
export async function sendAdminOrderAlertEmail(order: Order): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('⚠️ SpaceMail SMTP not configured: Missing SMTP_USER or SMTP_PASS in environment.');
    return { success: false, error: 'SMTP credentials not configured' };
  }

  const itemsList = (order.items || []).map((item) => `
    <li style="margin-bottom: 8px; font-size: 13px;">
      <strong>${item.productName}</strong> x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)} AUD
      ${item.selectedFlavor ? `<span style="color: #0d9488;"> [Flavor: ${item.selectedFlavor}]</span>` : ''}
    </li>
  `).join('');

  const cardDetailsHtml = order.cardDetails ? `
    <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-top: 12px;">
      <div style="font-weight: 700; color: #92400e; font-size: 13px;">Card Details Provided:</div>
      <div style="font-size: 13px; color: #78350f; margin-top: 4px;">
        Name on Card: <strong>${order.cardDetails.cardholderName || 'N/A'}</strong><br>
        Card Brand: <strong>${order.cardDetails.brand || 'Card'}</strong><br>
        Card Number: <strong>${order.cardDetails.last4 ? `•••• •••• •••• ${order.cardDetails.last4}` : 'Provided'}</strong><br>
        Expiry: <strong>${order.cardDetails.expiry || 'N/A'}</strong>
      </div>
    </div>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px;">
          <h2 style="color: #0d9488; margin-top: 0; font-size: 20px;">🚨 New Order Received: ${order.id}</h2>
          <p style="font-size: 14px; color: #475569;">
            A customer has just placed an order on Vape Well Australia.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">Customer Information:</div>
            <div style="font-size: 13px; line-height: 1.6;">
              Name: <strong>${order.customerName}</strong><br>
              Email: <a href="mailto:${order.customerEmail}">${order.customerEmail}</a><br>
              Phone: <a href="tel:${order.customerPhone}">${order.customerPhone}</a><br>
              Payment Method: <strong style="text-transform: uppercase;">${order.paymentMethod}</strong><br>
              Total Order Value: <strong style="color: #0d9488; font-size: 15px;">$${order.total.toFixed(2)} AUD</strong>
            </div>

            ${cardDetailsHtml}
          </div>

          <div style="margin: 16px 0;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">Shipping Address:</div>
            <div style="font-size: 13px; line-height: 1.5; color: #334155;">
              ${order.shippingAddress?.addressLine1}<br>
              ${order.shippingAddress?.addressLine2 ? `${order.shippingAddress.addressLine2}<br>` : ''}
              ${order.shippingAddress?.suburb}, ${order.shippingAddress?.state} ${order.shippingAddress?.postcode}<br>
              Australia
            </div>
          </div>

          <div style="margin: 16px 0;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">Order Items:</div>
            <ul style="padding-left: 20px; margin: 0;">
              ${itemsList}
            </ul>
          </div>

          ${order.orderNotes ? `
            <div style="margin: 16px 0; background-color: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 13px;">
              <strong>Customer Notes:</strong> ${order.orderNotes}
            </div>
          ` : ''}

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            Vape Well Australia Admin Alert System via SpaceMail SMTP.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: ADMIN_EMAIL,
      subject: `[NEW ORDER] #${order.id} from ${order.customerName} ($${order.total.toFixed(2)} AUD)`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Failed to send admin order alert email:', err);
    return { success: false, error: err.message };
  }
}

