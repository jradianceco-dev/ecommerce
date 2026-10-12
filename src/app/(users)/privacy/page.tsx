import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Globe, Mail, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | JRADIANCE Luxury Cosmetics",
  description:
    "Official Privacy Policy of JRADIANCE Cosmetics. Compliant with EU GDPR, UK GDPR, California CCPA/CPRA, and Nigeria Data Protection Act (NDPA 2023).",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-radiance-goldColor uppercase tracking-widest block mb-2">
          Global Compliance & Data Protection
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-radiance-charcoalTextColor tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500">
          Last Updated: October 2026 • Effective Date: October 2026
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8 text-sm text-gray-700 leading-relaxed">
        {/* Intro */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-radiance-goldColor" />
            1. Overview & Data Controller
          </h2>
          <p>
            Welcome to <strong>JRADIANCE Cosmetics</strong> (&quot;JRADIANCE&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We respect your personal privacy and are committed to protecting the personal data of all visitors, customers, and registered users across our e-commerce platform.
          </p>
          <p>
            This Privacy Policy governs our processing of personal data across all jurisdictions we serve, including <strong>Nigeria, the United States, the United Kingdom, and the European Union</strong>, in accordance with:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 pl-2">
            <li>The <strong>Nigeria Data Protection Act (NDPA 2023)</strong></li>
            <li>The <strong>EU General Data Protection Regulation (GDPR - Regulation EU 2016/679)</strong></li>
            <li>The <strong>UK Data Protection Act 2018 & UK GDPR</strong></li>
            <li>The <strong>California Consumer Privacy Act (CCPA as amended by CPRA)</strong> and applicable US state laws</li>
          </ul>
        </section>

        {/* Categories of Data */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Lock size={20} className="text-radiance-goldColor" />
            2. Personal Data We Collect
          </h2>
          <p>We collect personal information necessary to deliver our products and provide an optimal browsing experience:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-1">Directly Provided Data</h3>
              <p className="text-xs text-gray-600 leading-normal">
                Full name, email address, telephone number, shipping and delivery addresses, billing address, account login credentials, and communication records.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-1">Payment & Transaction Data</h3>
              <p className="text-xs text-gray-600 leading-normal">
                Transaction amounts, currency, and payment identifiers. <em>Note: All credit/debit card numbers are encrypted directly by PCI-DSS Level 1 certified processors (Stripe/Paystack). JRADIANCE never stores raw card credentials.</em>
              </p>
            </div>
          </div>
        </section>

        {/* Legal Basis */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">3. Legal Basis for Processing</h2>
          <p>Under GDPR and NDPA rules, we process personal data under the following legal bases:</p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-600 pl-2">
            <li><strong>Performance of a Contract:</strong> Processing orders, customer deliveries, and managing account profiles.</li>
            <li><strong>Legal Obligations:</strong> Compliance with financial accounting, tax documentation, and export laws.</li>
            <li><strong>Legitimate Interests:</strong> Fraud prevention, securing our platform, and enhancing product recommendations.</li>
            <li><strong>Explicit Consent:</strong> Direct marketing newsletters and optional analytics cookies.</li>
          </ul>
        </section>

        {/* International Transfers */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Globe size={20} className="text-radiance-goldColor" />
            4. International Data Transfers
          </h2>
          <p>
            Because JRADIANCE serves customers globally, your information may be processed in Nigeria, the United States, and cloud data centers worldwide. When personal data of individuals in the EU or UK is transferred abroad, we ensure appropriate safeguards such as Standard Contractual Clauses (SCCs) and adherence to cross-border transfer requirements under the NDPA.
          </p>
        </section>

        {/* Data Retention */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">5. Data Retention & Archival</h2>
          <p>
            We retain active user accounts for as long as your profile remains active. Transactional order data is retained for a mandatory rolling period of at least 12 months for tax, regulatory, and warranty compliance. When historical records expire, they are securely purged and archived under supervised administrative controls.
          </p>
        </section>

        {/* Your Rights */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">6. Your Privacy Rights</h2>
          <p>Depending on your geographic residence, you hold statutory rights regarding your personal information:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              "Right of Access & Portability",
              "Right to Rectification & Correction",
              "Right to Erasure ('Right to be Forgotten')",
              "Right to Restrict or Object to Processing",
              "Right to Withdraw Marketing Consent",
              "Right to Non-Discrimination (CCPA)",
            ].map((right, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{right}</span>
              </div>
            ))}
          </div>
          <p className="pt-2 text-xs text-gray-500">
            To exercise your rights, please contact our Data Protection representative at{" "}
            <a href="mailto:support@jradianceco.com" className="text-radiance-goldColor font-bold underline">
              support@jradianceco.com
            </a>.
          </p>
        </section>

        {/* Contact */}
        <section className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-gray-900">Questions or Inquiries?</h3>
            <p className="text-xs text-gray-500">Reach our global privacy team 24/7</p>
          </div>
          <a
            href="mailto:support@jradianceco.com"
            className="inline-flex items-center gap-2 bg-radiance-charcoalTextColor text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-radiance-goldColor transition shadow-sm"
          >
            <Mail size={14} />
            <span>Contact Privacy Office</span>
          </a>
        </section>
      </div>
    </div>
  );
}
