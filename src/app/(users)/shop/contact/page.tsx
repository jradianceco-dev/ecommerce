/**
 * =============================================================================
 * Contact Us Page
 * =============================================================================
 *
 * Customer contact form with:
 * - Multiple contact reasons
 * - Order linking (if applicable)
 * - Auto-response email
 * - Creates issue in admin panel
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type ContactReason = "general" | "order" | "product" | "complaint" | "other";

export default function ContactPage() {
  const router = useRouter();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    reason: "general" as ContactReason,
    subject: "",
    message: "",
    customer_email: "",
    customer_order_id: "",
  });

  // Auto-fill user email
  if (user?.email && !formData.customer_email) {
    setFormData((prev) => ({
      ...prev,
      customer_email: user.email,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Validate required fields
      if (!formData.subject.trim() || !formData.message.trim()) {
        throw new Error("Subject and message are required");
      }

      // Create issue in admin panel
      const { error } = await supabase.from("issues").insert({
        type: formData.reason === "complaint" ? "complaint" : "bug",
        title: formData.subject.trim(),
        description: formData.message.trim(),
        priority: "medium",
        status: "reported",
        reported_by: user?.id || null,
        customer_email: formData.customer_email,
        customer_order_id: formData.customer_order_id || null,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Message sent successfully! We'll respond within 24-48 hours.",
      });

      // Reset form
      setFormData({
        reason: "general",
        subject: "",
        message: "",
        customer_email: user?.email || "",
        customer_order_id: "",
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/shop");
      }, 3000);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const reasons = [
    {
      value: "general",
      label: "General Inquiry",
      description: "Questions about our company or services",
    },
    {
      value: "order",
      label: "Order Support",
      description: "Help with an existing order",
    },
    {
      value: "product",
      label: "Product Question",
      description: "Questions about products",
    },
    {
      value: "complaint",
      label: "Complaint",
      description: "Share your concerns",
    },
    { value: "other", label: "Other", description: "Anything else" },
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "info@jradianceco.com",
      description: "We'll respond within 24-48 hours",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+234 XXX XXX XXXX",
      description: "Mon-Fri, 9am-6pm WAT",
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Lagos, Nigeria",
      description: "Serving customers nationwide",
    },
    {
      icon: Clock,
      title: "Response Time",
      value: "24-48 Hours",
      description: "Average response time",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600">
          Have a question? We're here to help!
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {contactInfo.map((info) => {
          const Icon = info.icon;
          return (
            <div
              key={info.title}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center"
            >
              <Icon className="w-8 h-8 text-radiance-goldColor mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
              <p className="text-sm font-semibold text-radiance-goldColor mb-1">
                {info.value}
              </p>
              <p className="text-xs text-gray-500">{info.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Send Us a Message
          </h2>

          {/* Success Message */}
          {message?.type === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <p className="text-green-800 font-medium">{message.text}</p>
            </div>
          )}

          {/* Error Message */}
          {message?.type === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <p className="text-red-800 font-medium">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What is this regarding? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {reasons.map((reason) => (
                  <label
                    key={reason.value}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-radiance-goldColor cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={formData.reason === reason.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reason: e.target.value as ContactReason,
                        })
                      }
                      className="mt-1 text-radiance-goldColor focus:ring-radiance-goldColor"
                      required
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {reason.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {reason.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Brief summary of your inquiry"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Please provide as much detail as possible..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData({ ...formData, customer_email: e.target.value })
                }
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                required
                disabled={loading || !!user?.email}
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll use this to contact you about your inquiry
              </p>
            </div>

            {/* Order ID (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order ID (Optional)
              </label>
              <input
                type="text"
                value={formData.customer_order_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer_order_id: e.target.value,
                  })
                }
                placeholder="ORD-20240101-1234 (if related to an order)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Link this message to a specific order (if applicable)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-radiance-goldColor text-white py-3 rounded-xl font-bold hover:bg-radiance-charcoalTextColor transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {loading ? "Sending..." : "Send Message"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="space-y-6">
          {/* FAQ Link */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="font-bold text-blue-900 mb-3">
              Before You Contact Us
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Check our frequently asked questions - you might find your answer
              there!
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="text-sm font-semibold text-blue-700 hover:text-blue-900 underline"
            >
              Browse FAQ →
            </button>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Business Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monday - Friday</span>
                <span className="font-semibold">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saturday</span>
                <span className="font-semibold">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sunday</span>
                <span className="font-semibold text-red-600">Closed</span>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  * All times are in West Africa Time (WAT)
                </p>
              </div>
            </div>
          </div>

          {/* Support Promise */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <h3 className="font-bold text-green-900 mb-3">
              Our Support Promise
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Response within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Knowledgeable support team</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Personalized assistance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Follow-up until resolved</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
