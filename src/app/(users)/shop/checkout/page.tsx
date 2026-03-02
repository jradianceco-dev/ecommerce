/**
 * Checkout Page
 *
 * Customer checkout flow with:
 * - Delivery information form
 * - Payment integration (Paystack)
 * - Order creation with all cart items
 *
 * Access: Authenticated users only
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { clearCart } from "@/utils/supabase/services";
import { CreditCard, Truck, User, MapPin, Phone, Loader2, Package } from "lucide-react";
import type { CartItem as CartItemType } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const user = useUser();
  const { cart, totalItems, totalPrice, refreshCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [hasPendingOrder, setHasPendingOrder] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    shipping_address: "",
    billing_address: "",
  });

  // Check for pending orders and load cart when user is authenticated
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkPendingOrder = async () => {
      try {
        const supabase = createClient();
        const { data: orders } = await supabase
          .from('orders')
          .select('id, order_number, status, payment_status, total_amount, created_at')
          .eq('user_id', user.id)
          .in('status', ['pending'])
          .in('payment_status', ['pending'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (orders && orders.length > 0) {
          setHasPendingOrder(true);
          setPendingOrder(orders[0]);
          console.log('⚠️ User has pending order:', orders[0]);
        }
      } catch (error) {
        console.error('Error checking pending orders:', error);
      }
    };

    checkPendingOrder();
    refreshCart().then(() => setLoading(false));
  }, [user]);

  // Calculate totals from CartContext
  const subtotal = cart.reduce((acc, item) => {
    const price = item.product?.discount_price || item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.075; // 7.5% VAT
  const shipping = subtotal > 50000 ? 0 : 2500; // Free shipping above ₦50,000
  const total = subtotal + tax + shipping;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setProcessing(true);

    try {
      console.log('🛒 Starting checkout process...');
      console.log('👤 User:', user.id, user.email);
      console.log('🛍️ Cart items:', cart.length);
      console.log('💰 Total:', total);

      const supabase = createClient();

      // VALIDATE stock and prices before creating order
      console.log('🔍 Validating stock and prices...');
      const validationPromises = cart.map(async (item) => {
        const { data: product, error } = await supabase
          .from('products')
          .select('stock_quantity, price, discount_price, is_active')
          .eq('id', item.product_id)
          .single();
        
        if (error || !product) {
          throw new Error(`Product ${item.product?.name} is not available`);
        }
        
        if (!product.is_active) {
          throw new Error(`Product ${item.product?.name} is no longer available`);
        }
        
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Only ${product.stock_quantity} ${item.product?.name} left in stock`);
        }
        
        // Use current price (may have changed)
        const currentPrice = product.discount_price || product.price;
        return { ...item, unit_price: currentPrice };
      });

      const validatedItems = await Promise.all(validationPromises);
      console.log('✅ Validation passed');

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      console.log('📦 Creating order:', orderNumber);

      // Create order first
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          subtotal: subtotal,
          tax: tax,
          shipping_cost: shipping,
          total_amount: total,
          status: "pending",
          payment_status: "pending",
          shipping_address: formData.shipping_address,
          billing_address: formData.billing_address || formData.shipping_address,
          notes: null,
          estimated_delivery_date: null,
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Order creation error:', orderError);
        throw orderError;
      }
      if (!order) {
        console.error('❌ No order data returned');
        throw new Error("Failed to create order");
      }

      console.log('✅ Order created:', order.id);

      // Create order items from validated cart
      console.log('📦 Creating order items...');
      const orderItemsData = validatedItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || "Unknown Product",
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
      }));

      console.log('📦 Order items data:', orderItemsData);

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) {
        console.error('❌ Order items error:', itemsError);
        throw itemsError;
      }

      console.log('✅ Order items created');

      // Initialize Paystack payment BEFORE clearing cart
      // Cart will be cleared only after successful payment verification
      initializePayment(order);
    } catch (error) {
      console.error("❌ Checkout error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      alert("An error occurred during checkout: " + (error as any)?.message || "Unknown error");
      setProcessing(false);
    }
  }

  function initializePayment(order: any) {
    // Check if Paystack is available
    if (typeof window === "undefined" || !(window as any).PaystackPop) {
      alert("Payment gateway not available. Please try again.");
      setProcessing(false);
      return;
    }

    // Use Math.round to avoid floating point precision issues
    // Amount must be an integer (in kobo)
    const amountInKobo = Math.round(total * 100);
    console.log('💰 Payment amount:', amountInKobo, 'kobo (₦' + total + ')');

    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: user?.email || "",
      amount: amountInKobo, // Must be integer - Paystack expects amount in kobo
      currency: "NGN",
      ref: order.order_number,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: formData.full_name,
          },
          {
            display_name: "Phone Number",
            variable_name: "phone_number",
            value: formData.phone,
          },
        ],
      },
      callback: async (response: any) => {
        try {
          console.log('🔄 Verifying payment...', response.reference);
          
          // VERIFY payment with Paystack API
          const verifyUrl = `https://api.paystack.co/transaction/verify/${response.reference}`;
          const verifyResponse = await fetch(verifyUrl, {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
          });

          const verification = await verifyResponse.json();
          console.log('📋 Verification result:', verification);

          if (verification.status === 'success' && verification.data.status === 'success') {
            // Update order status to confirmed
            const supabase = createClient();
            const { error: updateError } = await supabase
              .from('orders')
              .update({
                payment_status: 'completed',
                payment_reference: response.reference,
                status: 'confirmed'
              })
              .eq('id', order.id);

            if (updateError) {
              console.error('Failed to update order:', updateError);
              throw updateError;
            }

            // NOW clear cart after successful payment
            await clearCart(user!.id);
            await refreshCart();
            
            alert("Payment successful! Your order has been placed.");
            router.push(`/shop/history?order=${order.id}`);
          } else {
            console.error('Payment verification failed:', verification);
            alert('Payment verification failed. Please contact support with reference: ' + response.reference);
            setProcessing(false);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          alert('Payment completed but verification failed. Please contact support with reference: ' + response.reference);
          setProcessing(false);
        }
      },
      onClose: () => {
        console.log('⚠️ Payment popup closed by user');
        alert("Payment cancelled. Your order is pending. Please complete payment to confirm your order.");
        setProcessing(false);
        // DO NOT clear cart - user may try again
      },
    });

    handler.openIframe();
  }

  // Show loading while cart is being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto text-radiance-goldColor" />
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  // Block checkout if there's a pending order
  if (hasPendingOrder && pendingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 size={32} className="animate-spin text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Pending Payment
          </h1>
          <p className="text-gray-600 mb-6">
            You have an unpaid order that needs to be completed first.
          </p>
          
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-orange-900 mb-2">
              Order: {pendingOrder.order_number}
            </p>
            <p className="text-sm text-orange-700">
              Amount: ₦{Number(pendingOrder.total_amount).toLocaleString()}
            </p>
            <p className="text-xs text-orange-600 mt-2">
              Created: {new Date(pendingOrder.created_at).toLocaleString()}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/shop/history?order=${pendingOrder.id}`)}
              className="w-full bg-radiance-goldColor text-white py-3 rounded-xl font-bold hover:bg-radiance-charcoalTextColor transition-colors"
            >
              Complete Payment
            </button>
            <button
              onClick={() => router.push("/shop/history")}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              View Order History
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            If your pending order has been cancelled by admin, please contact support or try again in a few minutes.
          </p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some items before checkout</p>
          <button
            onClick={() => router.push("/shop")}
            className="bg-radiance-goldColor text-white px-8 py-3 rounded-xl font-bold hover:bg-radiance-charcoalTextColor transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radiance-creamBackgroundColor py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-radiance-charcoalTextColor mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User size={20} className="text-radiance-goldColor" />
              Delivery Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Address *
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <textarea
                    value={formData.shipping_address}
                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    rows={3}
                    placeholder="Street address, city, state"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Address
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <textarea
                    value={formData.billing_address}
                    onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    rows={3}
                    placeholder="Same as shipping (leave blank)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-radiance-goldColor text-white py-4 rounded-xl font-bold text-lg hover:bg-radiance-charcoalTextColor transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Pay ₦{total.toLocaleString()}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck size={20} className="text-radiance-goldColor" />
                Order Summary ({totalItems} items)
              </h2>

              <div className="space-y-4 max-h-64 overflow-y-auto">
                {cart.map((item: CartItemType) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-radiance-goldColor">
                      ₦{((item.product?.discount_price || item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (7.5%)</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `₦${shipping.toLocaleString()}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-radiance-goldColor">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-start gap-3">
                <CreditCard size={20} className="text-green-600 mt-0.5" />
                <div>
                  <p className="font-bold text-green-900 text-sm">Secure Payment</p>
                  <p className="text-xs text-green-700 mt-1">
                    Your payment is secured with Paystack. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
