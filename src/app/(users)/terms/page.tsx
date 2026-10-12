import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldAlert, CreditCard, Scale, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | JRADIANCE Luxury Cosmetics",
  description:
    "Official Terms of Service and Online Conditions of Sale for JRADIANCE Cosmetics. Governs purchases, dual-currency pricing, and customer agreements.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-radiance-goldColor uppercase tracking-widest block mb-2">
          Customer Agreement & Store Policies
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-radiance-charcoalTextColor tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500">
          Last Updated: October 2026 • Valid for All Store Orders
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8 text-sm text-gray-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-radiance-goldColor" />
            1. Agreement to Terms
          </h2>
          <p>
            By accessing, browsing, or completing an order on <strong>JRADIANCE Cosmetics</strong> (&quot;the Store&quot;, &quot;we&quot;, &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree with all terms, you must discontinue using our services immediately.
          </p>
          <p>
            You must be at least 18 years old or possess legal parental/guardian consent in your jurisdiction to place orders on this website.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard size={20} className="text-radiance-goldColor" />
            2. Multi-Currency Pricing & Payment Processing
          </h2>
          <p>
            All products are priced in Nigerian Naira (NGN) and US Dollars (USD). We utilize real-time international exchange rate references to maintain transparent multi-currency transactions across Nigeria, the United States, the United Kingdom, and Europe.
          </p>
          <p>
            Payment transactions are processed securely through certified third-party gateway providers (Stripe and Paystack). By submitting payment details, you confirm that you are authorized to utilize the designated payment card or account.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">3. Orders, Stock Reservation & Acceptance</h2>
          <p>
            When you initiate checkout, our platform executes an atomic stock reservation to prevent overselling. Submission of an order constitutes an offer to purchase. An order is accepted only when you receive an official Order Confirmation with an assigned tracking number.
          </p>
          <p>
            We reserve the right to decline or cancel orders resulting from pricing typographical errors, inventory discrepancies, or suspected fraudulent activity. In such instances, all debited funds are immediately returned in full.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert size={20} className="text-radiance-goldColor" />
            4. Product Ingredients & Health Disclaimers
          </h2>
          <p>
            JRADIANCE products are formulated using premium organic and cosmetic-grade ingredients. Prior to using any skincare, body, or cosmetic item, customers are advised to inspect the published International Nomenclature of Cosmetic Ingredients (INCI) listing and conduct a patch test.
          </p>
          <p>
            Our products are intended solely for personal cosmetic enhancement and are not manufactured or intended to diagnose, treat, cure, or prevent any medical dermatological condition.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Scale size={20} className="text-radiance-goldColor" />
            5. Intellectual Property & Governing Law
          </h2>
          <p>
            All website designs, trademarks, brand logos, product photography, text content, and software are the exclusive intellectual property of JRADIANCE Cosmetics and its parent corporate group. Reproduction without written consent is strictly prohibited.
          </p>
          <p>
            These terms shall be governed and interpreted in accordance with applicable commercial and e-commerce laws. Consumer rights guaranteed under mandatory local consumer protection statutes (such as the UK Consumer Rights Act and EU Consumer Rights Directive) remain fully safeguarded.
          </p>
        </section>

        {/* Section 6 */}
        <section className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-gray-900">Need clarification?</h3>
            <p className="text-xs text-gray-500">Review our related store policies</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/refund-policy"
              className="text-xs font-bold text-radiance-goldColor hover:underline px-3 py-1.5"
            >
              Refund & Hygiene Policy →
            </Link>
            <Link
              href="/shipping-policy"
              className="text-xs font-bold text-radiance-goldColor hover:underline px-3 py-1.5"
            >
              Shipping Policy →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
