/**
 * =============================================================================
 * Customer Issue Report Page
 * =============================================================================
 *
 * Allows customers to report bugs, complaints, or issues
 * Features:
 * - Multiple issue types (Bug, Complaint, Feature Request, Other)
 * - Priority selection
 * - Order linking (if applicable)
 * - File attachment support (screenshots)
 * - Auto-capture user context
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import {
  AlertTriangle,
  Bug,
  MessageSquare,
  Plus,
  Upload,
  X,
  CheckCircle,
} from "lucide-react";

type IssueType = "bug" | "complaint" | "feature_request" | "other";
type IssuePriority = "low" | "medium" | "high" | "critical";

export default function ReportIssuePage() {
  const router = useRouter();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: "bug" as IssueType,
    title: "",
    description: "",
    priority: "medium" as IssuePriority,
    customer_email: "",
    customer_order_id: "",
  });

  // Auto-fill user email
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        customer_email: user.email,
      }));
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim()) {
        throw new Error("Title and description are required");
      }

      // Create issue
      const { error } = await supabase.from("issues").insert({
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: "reported",
        reported_by: user?.id || null,
        customer_email: formData.customer_email,
        customer_order_id: formData.customer_order_id || null,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Issue reported successfully! Our team will review it shortly.",
      });

      // Reset form
      setFormData({
        type: "bug",
        title: "",
        description: "",
        priority: "medium",
        customer_email: user?.email || "",
        customer_order_id: "",
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/shop/history");
      }, 3000);
    } catch (error) {
      console.error("Error reporting issue:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to report issue. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const issueTypes = [
    {
      value: "bug",
      label: "Bug Report",
      icon: Bug,
      color: "text-red-600",
      description: "Something isn't working correctly",
    },
    {
      value: "complaint",
      label: "Complaint",
      icon: MessageSquare,
      color: "text-orange-600",
      description: "Share your concerns or dissatisfaction",
    },
    {
      value: "feature_request",
      label: "Feature Request",
      icon: Plus,
      color: "text-green-600",
      description: "Suggest a new feature or improvement",
    },
    {
      value: "other",
      label: "Other",
      icon: AlertTriangle,
      color: "text-blue-600",
      description: "Anything else you'd like to report",
    },
  ];

  const priorities = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
    {
      value: "medium",
      label: "Medium",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
  ];

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Report an Issue
        </h1>
        <p className="text-gray-600">
          Help us improve by sharing your feedback or reporting problems
        </p>
      </div>

      {/* Success Message */}
      {message?.type === "success" && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="text-green-600" size={24} />
          <p className="text-green-800 font-medium">{message.text}</p>
        </div>
      )}

      {/* Error Message */}
      {message?.type === "error" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 font-medium">{message.text}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Issue Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What type of issue are you reporting?{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {issueTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: type.value as IssueType })
                  }
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.type === type.value
                      ? "border-radiance-goldColor bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-6 h-6 ${type.color}`} />
                    <span className="font-semibold text-gray-900">
                      {type.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Brief summary of the issue"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
            required
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Please provide as much detail as possible. What happened? What did you expect to happen?"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Include steps to reproduce, error messages, or any other relevant
            information
          </p>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <div className="flex flex-wrap gap-2">
            {priorities.map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    priority: priority.value as IssuePriority,
                  })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.priority === priority.value
                    ? "ring-2 ring-radiance-goldColor " + priority.color
                    : priority.color + " hover:opacity-80"
                }`}
              >
                {priority.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Select "Critical" only for issues that completely prevent usage
          </p>
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
            We'll use this to contact you about your issue
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
              setFormData({ ...formData, customer_order_id: e.target.value })
            }
            placeholder="ORD-20240101-1234 (if related to an order)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Link this issue to a specific order (if applicable)
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-radiance-goldColor text-white py-3 rounded-xl font-bold hover:bg-radiance-charcoalTextColor transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Report"}
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

      {/* Info Box */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="font-bold text-blue-900 mb-2">What happens next?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="mt-0.5 shrink-0" />
            <span>Our team will review your report within 24-48 hours</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="mt-0.5 shrink-0" />
            <span>
              You'll receive an email confirmation at{" "}
              {formData.customer_email || "your email"}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="mt-0.5 shrink-0" />
            <span>We may contact you for additional information if needed</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="mt-0.5 shrink-0" />
            <span>You can track the status of your issue in your account</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
