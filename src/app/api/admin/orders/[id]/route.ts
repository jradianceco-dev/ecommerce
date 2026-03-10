/**
 * Admin Order Delete API
 * 
 * Soft-delete orders to avoid database clustering
 * Only admins can delete orders
 * 
 * Rules:
 * - Can only delete orders with status: 'cancelled', 'pending' (older than 24hrs)
 * - NEVER delete orders with payment_status: 'completed'
 * - Soft delete: sets deleted_at timestamp instead of removing row
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * DELETE /api/admin/orders/[id]
 * 
 * Soft-delete an order
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'agent', 'chief_admin'].includes(profile.role)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch order details
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status, payment_status, created_at, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // VALIDATION: Never delete completed payments
    if (order.payment_status === 'completed') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete orders with completed payments. This is required for financial records.' 
        },
        { status: 400 }
      );
    }

    // VALIDATION: Check if order is eligible for deletion
    const orderAge = Date.now() - new Date(order.created_at).getTime();
    const is24HoursOld = orderAge > 24 * 60 * 60 * 1000;

    if (order.status === 'pending' && !is24HoursOld) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Pending orders must be at least 24 hours old before deletion' 
        },
        { status: 400 }
      );
    }

    // ELIGIBLE statuses for deletion
    const eligibleStatuses = ['cancelled', 'pending', 'returned'];
    if (!eligibleStatuses.includes(order.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete order with status: ${order.status}. Only cancelled, pending (24h+), or returned orders can be deleted.` 
        },
        { status: 400 }
      );
    }

    // Perform soft delete
    const { error: deleteError } = await supabase
      .from('orders')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (deleteError) {
      console.error('[Admin Delete Order] Failed to delete order:', deleteError);
      return NextResponse.json(
        { success: false, message: 'Failed to delete order' },
        { status: 500 }
      );
    }

    // Log the action
    await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: user.id,
        action: 'order_soft_deleted',
        resource_type: 'orders',
        resource_id: id,
        changes: {
          old_status: order.status,
          old_payment_status: order.payment_status,
          deleted_at: new Date().toISOString(),
        },
      });

    console.log(`[Admin Delete Order] Order ${id} soft-deleted by admin ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
      orderId: id,
    });

  } catch (error) {
    console.error('[Admin Delete Order] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/orders/[id]
 * 
 * Get order details (for admin verification)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'agent', 'chief_admin'].includes(profile.role)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch order details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        created_at,
        updated_at,
        deleted_at,
        user_id,
        profiles (email, full_name)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error('[Admin Get Order] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
