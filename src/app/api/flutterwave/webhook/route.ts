/**
 * Flutterwave Webhook Handler
 *
 * Handles async payment notifications from Flutterwave
 * Updates order status based on payment events
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createHash } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json();
    const signature = req.headers.get('verif-hash');

    if (!signature) {
      console.error('[Flutterwave Webhook] No signature provided');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const hash = createHash('sha256')
      .update(process.env.FLUTTERWAVE_SECRET_KEY!, 'utf8')
      .digest('hex');

    if (hash !== signature) {
      console.error('[Flutterwave Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const event = body.event;
    const data = body.data;

    console.log('[Flutterwave Webhook] Received event:', event, data.tx_ref);

    // Handle different events
    switch (event) {
      case 'charge.completed':
      case 'charge.success':
        await handleChargeSuccess(supabase, data);
        break;

      case 'charge.failed':
        await handleChargeFailed(supabase, data);
        break;

      case 'charge.refunded':
        await handleChargeRefund(supabase, data);
        break;

      default:
        console.log('[Flutterwave Webhook] Unhandled event:', event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Flutterwave Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful charge
 */
async function handleChargeSuccess(supabase: any, data: any) {
  const orderId = data.meta?.order_id;

  if (!orderId) {
    console.error('[Flutterwave Webhook] No order_id in metadata');
    return;
  }

  // Update order
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'completed',
      payment_reference: data.tx_ref,
      flutterwave_tx_ref: data.tx_ref,
      flutterwave_status: data.status,
      payment_verified_at: new Date().toISOString(),
      status: 'confirmed'
    })
    .eq('id', orderId);

  if (error) {
    console.error('[Flutterwave Webhook] Failed to update order:', error);
    throw error;
  }

  console.log('[Flutterwave Webhook] Order', orderId, 'marked as paid');
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(supabase: any, data: any) {
  const orderId = data.meta?.order_id;

  if (!orderId) return;

  // Update order
  await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      flutterwave_tx_ref: data.tx_ref,
      flutterwave_status: data.status
    })
    .eq('id', orderId);

  console.log('[Flutterwave Webhook] Order', orderId, 'payment failed');
}

/**
 * Handle refund
 */
async function handleChargeRefund(supabase: any, data: any) {
  const orderId = data.meta?.order_id;

  if (!orderId) return;

  // Update order
  await supabase
    .from('orders')
    .update({
      payment_status: 'refunded',
      flutterwave_tx_ref: data.tx_ref,
      flutterwave_status: data.status
    })
    .eq('id', orderId);

  console.log('[Flutterwave Webhook] Order', orderId, 'refunded');
}

// Allow GET requests for testing
export async function GET() {
  return NextResponse.json({ status: 'Flutterwave webhook endpoint is running' });
}
