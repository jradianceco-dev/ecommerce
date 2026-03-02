/**
 * Paystack Webhook Handler
 * 
 * Handles async payment notifications from Paystack
 * Updates order status based on payment events
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createHash } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json();
    const signature = req.headers.get('x-paystack-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }
    
    // Verify webhook signature
    const hash = createHash('sha512')
      .update(JSON.stringify(body), 'utf8')
      .update(process.env.PAYSTACK_SECRET_KEY!, 'utf8')
      .digest('hex');
    
    if (hash !== signature) {
      console.error('[Paystack Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const supabase = await createClient();
    const event = body.event;
    const data = body.data;
    
    console.log('[Paystack Webhook] Received event:', event, data.reference);
    
    // Handle different events
    switch (event) {
      case 'charge.success':
        await handleChargeSuccess(supabase, data);
        break;
      
      case 'charge.failed':
        await handleChargeFailed(supabase, data);
        break;
      
      case 'charge.refund':
        await handleChargeRefund(supabase, data);
        break;
      
      default:
        console.log('[Paystack Webhook] Unhandled event:', event);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Paystack Webhook] Error:', error);
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
  const orderId = data.metadata?.order_id;
  
  if (!orderId) {
    console.error('[Paystack Webhook] No order_id in metadata');
    return;
  }
  
  // Update order
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'completed',
      payment_reference: data.reference,
      payment_verified_at: new Date().toISOString(),
      payment_metadata: data,
      status: 'confirmed'
    })
    .eq('id', orderId);
  
  if (error) {
    console.error('[Paystack Webhook] Failed to update order:', error);
    throw error;
  }
  
  console.log('[Paystack Webhook] Order', orderId, 'marked as paid');
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(supabase: any, data: any) {
  const orderId = data.metadata?.order_id;
  
  if (!orderId) return;
  
  // Update order
  await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      payment_metadata: data
    })
    .eq('id', orderId);
  
  console.log('[Paystack Webhook] Order', orderId, 'payment failed');
}

/**
 * Handle refund
 */
async function handleChargeRefund(supabase: any, data: any) {
  const orderId = data.metadata?.order_id;
  
  if (!orderId) return;
  
  // Update order
  await supabase
    .from('orders')
    .update({
      payment_status: 'refunded',
      payment_metadata: data
    })
    .eq('id', orderId);
  
  console.log('[Paystack Webhook] Order', orderId, 'refunded');
}

// Allow GET requests for testing
export async function GET() {
  return NextResponse.json({ status: 'Paystack webhook endpoint is running' });
}
