"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Mail, Package } from "lucide-react";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const order = searchParams.get("order");
    const orderNum = searchParams.get("order_number");
    if (order) {
      setOrderId(order);
    }
    if (orderNum) {
      setOrderNumber(orderNum);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-black text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-8">
          Thank you for your order. We've sent a confirmation email with your order details.
        </p>

        {/* Order Details */}
        {(orderId || orderNumber) && (
          <div className="bg-radiance-creamBackgroundColor rounded-xl p-4 mb-8 border-2 border-radiance-goldColor/20">
            {orderNumber && (
              <>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="font-bold text-lg text-radiance-goldColor">{orderNumber}</p>
              </>
            )}
            {orderId && orderNumber && (
              <div className="my-2 border-t border-gray-200"></div>
            )}
            {orderId && (
              <>
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="font-mono text-sm">{orderId}</p>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => router.push(`/shop/history${orderId ? `?order=${orderId}` : ""}`)}
            className="w-full bg-radiance-goldColor text-white py-3 rounded-xl font-bold hover:bg-radiance-charcoalTextColor transition-colors flex items-center justify-center gap-2"
          >
            <Package size={18} />
            View Order Details
          </button>
          <button
            onClick={() => router.push("/shop")}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        {/* Email Notification */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          <Mail size={16} className="text-blue-600" />
          <p>A confirmation email has been sent to your email address</p>
        </div>

        {/* Security Note */}
        <div className="mt-8 text-xs text-gray-400">
          <p>A secure payment receipt has been generated for your records.</p>
        </div>
      </div>
    </div>
  );
}
