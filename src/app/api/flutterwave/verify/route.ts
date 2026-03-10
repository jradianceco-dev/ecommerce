/**
 * Flutterwave Payment Verification API
 * 
 * Server-side verification of Flutterwave transactions
 * Keeps secret key secure and provides type-safe verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { PaymentVerificationResult } from '@/types/flutterwave';

/**
 * POST /api/flutterwave/verify
 * 
 * Verify a Flutterwave transaction reference
 */
export async function POST(req: NextRequest) {
  try {
    const { tx_ref, order_id } = await req.json();

    // Validate input
    if (!tx_ref) {
      return NextResponse.json<PaymentVerificationResult>(
        { success: false, message: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    if (!order_id) {
      return NextResponse.json<PaymentVerificationResult>(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('[Flutterwave Verify] Verifying transaction:', tx_ref);

    // Verify with Flutterwave API
    const verifyUrl = `https://api.flutterwave.com/transactions/${tx_ref}/verify`;
    
    const flutterwaveResponse = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const verificationData = await flutterwaveResponse.json();

    console.log('[Flutterwave Verify] Flutterwave response:', verificationData);

    if (verificationData.status !== 'success') {
      return NextResponse.json<PaymentVerificationResult>(
        { 
          success: false, 
          message: verificationData.message || 'Verification failed' 
        },
        { status: 400 }
      );
    }

    const transaction = verificationData.data;

    // Check transaction status
    if (transaction.status !== 'successful') {
      return NextResponse.json<PaymentVerificationResult>(
        { 
          success: false, 
          message: `Payment status: ${transaction.status}`,
          transaction 
        },
        { status: 400 }
      );
    }

    // Update order in database
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        payment_reference: tx_ref,
        flutterwave_tx_ref: tx_ref,
        flutterwave_status: transaction.status,
        payment_verified_at: new Date().toISOString(),
        status: 'confirmed',
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('[Flutterwave Verify] Failed to update order:', updateError);
      return NextResponse.json<PaymentVerificationResult>(
        { 
          success: false, 
          message: 'Failed to update order status',
          transaction 
        },
        { status: 500 }
      );
    }

    console.log('[Flutterwave Verify] Order', order_id, 'updated successfully');

    return NextResponse.json<PaymentVerificationResult>({
      success: true,
      message: 'Payment verified successfully',
      transaction,
      orderUpdated: true,
    });

  } catch (error) {
    console.error('[Flutterwave Verify] Error:', error);
    return NextResponse.json<PaymentVerificationResult>(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Verification failed' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/flutterwave/verify
 * 
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Flutterwave verification endpoint is running',
  });
}
