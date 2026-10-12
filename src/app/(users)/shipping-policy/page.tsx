import type { Metadata } from "next";
import Link from "next/link";
import { Truck, Globe, Clock, ShieldCheck, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Customs Policy | JRADIANCE Luxury Cosmetics",
  description:
    "Official Shipping Policy of JRADIANCE Cosmetics. Details international delivery timelines, customs duties, tracking, and courier handling for Nigeria, USA, UK, and Europe.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-radiance-goldColor uppercase tracking-widest block mb-2">
          Global Logistics & Fulfillment
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-radiance-charcoalTextColor tracking-tight mb-4">
          Shipping & Delivery Policy
        </h1>
        <p className="text-sm text-gray-500">
          Last Updated: October 2026 • Worldwide Delivery Guidelines
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8 text-sm text-gray-700 leading-relaxed">
        {/* Geographic Scope */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Globe size={20} className="text-radiance-goldColor" />
            1. Geographic Service Regions
          </h2>
          <p>
            JRADIANCE operates dedicated international fulfillment channels servicing customers across four primary regions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <MapPin size={18} className="text-emerald-600 shrink-0" />
              <div>
                <strong className="block text-gray-900">Nigeria (Domestic)</strong>
                <span className="text-xs text-gray-500">Lagos, Abuja, Port Harcourt & Nationwide</span>
              </div>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <MapPin size={18} className="text-blue-600 shrink-0" />
              <div>
                <strong className="block text-gray-900">United States & Canada</strong>
                <span className="text-xs text-gray-500">All 50 US States & Canadian Provinces</span>
              </div>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <MapPin size={18} className="text-purple-600 shrink-0" />
              <div>
                <strong className="block text-gray-900">United Kingdom</strong>
                <span className="text-xs text-gray-500">England, Scotland, Wales & Northern Ireland</span>
              </div>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <MapPin size={18} className="text-amber-600 shrink-0" />
              <div>
                <strong className="block text-gray-900">European Union</strong>
                <span className="text-xs text-gray-500">All Schengen & EU Member States</span>
              </div>
            </div>
          </div>
        </section>

        {/* Timelines */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-radiance-goldColor" />
            2. Estimated Delivery Timelines
          </h2>
          <p>
            Orders are processed and dispatched within <strong>24–48 hours</strong> (excluding weekends and statutory holidays):
          </p>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-900">
                <tr>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Shipping Method</th>
                  <th className="p-3">Estimated Transit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Lagos, Nigeria</td>
                  <td className="p-3">Standard Courier</td>
                  <td className="p-3">1 – 2 Business Days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Other Nigerian States</td>
                  <td className="p-3">Interstate Express</td>
                  <td className="p-3">2 – 5 Business Days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">United Kingdom</td>
                  <td className="p-3">International Priority Air</td>
                  <td className="p-3">4 – 7 Business Days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">United States</td>
                  <td className="p-3">International Express</td>
                  <td className="p-3">5 – 8 Business Days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">European Union</td>
                  <td className="p-3">International Tracked</td>
                  <td className="p-3">5 – 9 Business Days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Customs and Taxes */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-radiance-goldColor" />
            3. Customs, Import Duties & Cross-Border Taxes
          </h2>
          <p>
            For international shipments to the United States, United Kingdom, and the European Union, orders may be subject to local import taxes, customs duties, or handling fees assessed by destination border authorities.
          </p>
          <p className="text-xs text-gray-600">
            Unless explicitly designated as DDP (Delivered Duty Paid) during checkout, international cross-border packages are shipped on a <strong>DDU (Delivered Duty Unpaid)</strong> basis. The recipient is responsible for any applicable local import customs charges.
          </p>
        </section>

        {/* Tracking */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Truck size={20} className="text-radiance-goldColor" />
            4. Real-Time Tracking & Signature
          </h2>
          <p>
            Upon parcel dispatch, you will automatically receive an email confirmation containing your courier tracking number. You can monitor your delivery real-time on our{" "}
            <Link href="/shop/track-order" className="text-radiance-goldColor font-bold underline">
              Order Tracking Portal
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
