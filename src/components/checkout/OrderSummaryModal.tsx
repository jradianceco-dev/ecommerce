"use client";

import { X } from "lucide-react";

interface OrderItem {
  product_name: string;
  quantity: number;
  total_price: number;
}

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    orderNumber: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export default function OrderSummaryModal({
  isOpen,
  onClose,
  order,
}: OrderSummaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="font-bold">{order.orderNumber}</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">Items ({order.items.length})</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-radiance-goldColor">
                      ₦{item.total_price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₦{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (7.5%)</span>
                <span>₦{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "FREE" : `₦${order.shipping.toLocaleString()}`}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-radiance-goldColor">₦{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
