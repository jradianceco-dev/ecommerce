/**
 * =============================================================================
 * Order Tracking Page
 * =============================================================================
 *
 * Real-time order tracking with:
 * - Order status timeline
 * - Delivery updates
 * - Order details
 * - Estimated delivery date
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import { Package, Truck, CheckCircle, Clock, AlertCircle, Mail, Phone } from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";

interface OrderTrack {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: string;
  total_amount: number;
  created_at: string;
  estimated_delivery_date: string | null;
  shipping_address: string | null;
  items?: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

export default function TrackOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<OrderTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load if order_number in URL
  useEffect(() => {
    const orderNum = searchParams.get("order");
    if (orderNum) {
      setOrderNumber(orderNum);
      trackOrder(orderNum);
    }
  }, [searchParams]);

  async function trackOrder(num: string) {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          created_at,
          estimated_delivery_date,
          shipping_address,
          order_items (
            product_name,
            quantity,
            unit_price
          )
        `)
        .eq("order_number", num)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Order not found");

      setOrder({
        ...data,
        items: data.order_items || [],
      });
    } catch (err) {
      console.error("Error tracking order:", err);
      setError(err instanceof Error ? err.message : "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError("Please enter an order number");
      return;
    }
    trackOrder(orderNumber);
  }

  const statusSteps = [
    { status: "pending", label: "Order Placed", icon: Clock, color: "text-yellow-600" },
    { status: "confirmed", label: "Confirmed", icon: CheckCircle, color: "text-blue-600" },
    { status: "shipped", label: "Shipped", icon: Truck, color: "text-purple-600" },
    { status: "delivered", label: "Delivered", icon: Package, color: "text-green-600" },
  ];

  const getStatusStep = (status: OrderStatus) => {
    const stepIndex = statusSteps.findIndex(s => s.status === status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const currentStep = order ? getStatusStep(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-lg text-gray-600">
          Enter your order number to see real-time updates
        </p>
      </div>

      {/* Tracking Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Number
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="ORD-20240101-1234"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent uppercase"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-radiance-goldColor text-white rounded-xl font-bold hover:bg-radiance-charcoalTextColor transition-colors disabled:opacity-50"
              >
                {loading ? "Tracking..." : "Track"}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Order Details */}
      {order && (
        <div className="space-y-8">
          {/* Order Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                order.status === "delivered" ? "bg-green-100 text-green-800" :
                order.status === "cancelled" ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {order.status.toUpperCase()}
              </div>
            </div>

            {/* Order Total */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold text-radiance-goldColor">
                  ₦{order.total_amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status</h3>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200">
                <div 
                  className="bg-radiance-goldColor transition-all duration-500"
                  style={{ 
                    height: `${(currentStep / (statusSteps.length - 1)) * 100}%` 
                  }}
                />
              </div>

              {/* Status Steps */}
              <div className="space-y-6 relative">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.status} className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted 
                          ? "bg-radiance-goldColor border-radiance-goldColor text-white" 
                          : "bg-white border-gray-300 text-gray-400"
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${isCurrent ? "text-radiance-goldColor" : "text-gray-900"}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-gray-500 mt-1">
                            {order.status === "pending" && "Waiting for confirmation"}
                            {order.status === "confirmed" && "Preparing your order"}
                            {order.status === "shipped" && "On the way to you"}
                            {order.status === "delivered" && "Order completed"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          {order.estimated_delivery_date && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Truck className="text-blue-600 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2">Estimated Delivery</h3>
                  <p className="text-blue-800">
                    Your order will arrive by{" "}
                    <span className="font-bold">
                      {new Date(order.estimated_delivery_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={20} className="text-radiance-goldColor" />
                Shipping Address
              </h3>
              <p className="text-gray-600 whitespace-pre-line">{order.shipping_address}</p>
            </div>
          )}

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-semibold text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-radiance-goldColor">
                      ₦{(item.unit_price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support Contact */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <h3 className="font-bold text-green-900 mb-4">Need Help?</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-green-800">
                <Mail size={18} />
                <span className="text-sm">info@jradianceco.com</span>
              </div>
              <div className="flex items-center gap-3 text-green-800">
                <Phone size={18} />
                <span className="text-sm">+234 XXX XXX XXXX</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!order && !loading && !error && (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">Enter your order number to track your order</p>
        </div>
      )}
    </div>
  );
}
