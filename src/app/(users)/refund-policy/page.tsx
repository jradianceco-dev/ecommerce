import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, ShieldCheck, AlertCircle, CheckCircle2, PackageCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Refund Policy | JRADIANCE Luxury Cosmetics",
  description:
    "Official Return and Refund Policy of JRADIANCE Cosmetics. Compliant with UK Consumer Rights Act, EU Consumer Rights Directive, and health/hygiene seal regulations.",
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-radiance-goldColor uppercase tracking-widest block mb-2">
          Consumer Rights & Hygiene Standards
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-radiance-charcoalTextColor tracking-tight mb-4">
          Return & Refund Policy
        </h1>
        <p className="text-sm text-gray-500">
          Last Updated: October 2026 • Valid Across Nigeria, USA, UK & Europe
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8 text-sm text-gray-700 leading-relaxed">
        {/* Important Hygiene Notice */}
        <div className="p-4 sm:p-5 bg-amber-50/90 border-2 border-amber-300 rounded-2xl flex items-start gap-3.5">
          <AlertCircle size={22} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <h3 className="font-bold text-sm text-amber-950 uppercase tracking-wide">
              Essential Cosmetic Health & Hygiene Seal Notice
            </h3>
            <p>
              Under <strong>EU Directive 2011/83/EU (Article 16e)</strong>, the <strong>UK Consumer Contracts Regulations (Reg 28(3)(a))</strong>, and international health standards, cosmetic, skincare, and beauty products with opened, broken, or tampered protective seals are <strong>strictly exempt from returns</strong> for health protection and hygiene reasons.
            </p>
          </div>
        </div>

        {/* 14-Day Statutory Right */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw size={20} className="text-radiance-goldColor" />
            1. 14-Day Right of Withdrawal (Unopened Items)
          </h2>
          <p>
            You have the statutory right to cancel your purchase within <strong>14 days of receipt</strong> of your delivery. To be eligible for a return and refund under this provision, the item must fulfill the following mandatory conditions:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-600 pl-2">
            <li>The product must be completely unused, unswatched, and in its original pristine condition.</li>
            <li>All manufacturer hygiene seals, shrink wrap, tamper-evident seals, and protective boxes must remain <strong>fully intact and untampered</strong>.</li>
            <li>The product must be enclosed with all original accessories, documentation, and purchase receipts.</li>
          </ul>
        </section>

        {/* Hygiene Exemption */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-radiance-goldColor" />
            2. Opened & Unsealed Items (Non-Returnable)
          </h2>
          <p>
            Due to the organic, sterile nature of our facial creams, serums, lotions, and cosmetics, we cannot restock or resell any item that has been opened. Once a hygiene seal is broken or the product container is opened, the item is permanently deemed consumed and cannot be returned for a refund.
          </p>
        </section>

        {/* Damaged or Defective Goods */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <PackageCheck size={20} className="text-radiance-goldColor" />
            3. Damaged, Defective, or Incorrect Deliveries
          </h2>
          <p>
            In the rare event that your package arrives damaged in transit, defective, or contains an incorrect item, we will arrange a complimentary replacement or full refund:
          </p>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <p className="font-bold text-gray-900">How to report:</p>
            <p className="text-xs text-gray-600">
              Notify our support team within <strong>48 hours of delivery</strong> by emailing{" "}
              <a href="mailto:support@jradianceco.com" className="text-radiance-goldColor font-bold underline">
                support@jradianceco.com
              </a>{" "}
              with your order number, a brief explanation, and high-resolution photographs of the transit box and damaged product.
            </p>
          </div>
        </section>

        {/* Refund Processing Timeline */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">4. Refund Processing & Timelines</h2>
          <p>
            Once your returned item is received and inspected at our fulfillment center (or your damaged item claim is validated), our finance department will process your refund:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-600 pl-2">
            <li>Refunds are credited to the original payment method (Stripe or Paystack).</li>
            <li>Credit card refunds typically reflect within <strong>5–10 business days</strong> depending on your bank issuer.</li>
            <li>Original delivery fees are refunded for orders cancelled prior to dispatch or orders containing verified damaged items.</li>
          </ul>
        </section>

        {/* Contact CTA */}
        <section className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-gray-900">Need return assistance?</h3>
            <p className="text-xs text-gray-500">Our customer care team is here to assist</p>
          </div>
          <Link
            href="/shop/contact"
            className="inline-flex items-center gap-2 bg-radiance-goldColor text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-radiance-charcoalTextColor transition shadow-sm"
          >
            <span>Initiate Return Inquiry</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
