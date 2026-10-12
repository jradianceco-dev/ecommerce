"use client";

import React, { useState } from "react";
import {
  getPurgePreview,
  executeDatabasePurge,
  PurgeScope,
  PurgePreviewResult,
} from "@/app/admin/(admin)/purge-actions";
import { generatePurgeArchivePDF } from "@/utils/pdf/generatePurgeArchive";
import {
  Trash2,
  FileDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";

interface DatabasePurgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  superDirectorEmail?: string;
  onPurgeSuccess?: () => void;
}

export default function DatabasePurgeModal({
  isOpen,
  onClose,
  superDirectorEmail = "Super Director",
  onPurgeSuccess,
}: DatabasePurgeModalProps) {
  // Current year minus 1 is the most recent eligible year for 12-month retention
  const currentYear = new Date().getFullYear();
  const eligibleYears = [currentYear - 2, currentYear - 1]; // e.g., 2024, 2025

  const [selectedYear, setSelectedYear] = useState<number>(eligibleYears[0] || 2024);
  const [selectedScope, setSelectedScope] = useState<PurgeScope>("transactions");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PurgePreviewResult | null>(null);

  // Safety & PDF enforcement state
  const [hasDownloadedPdf, setHasDownloadedPdf] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isPurging, setIsPurging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const expectedPhrase = `PURGE DATABASE ${selectedYear}`;
  const isConfirmationMatched = confirmationInput.trim().toUpperCase() === expectedPhrase;

  async function handleCalculatePreview() {
    setLoadingPreview(true);
    setErrorMessage(null);
    setHasDownloadedPdf(false);
    setConfirmationInput("");

    const res = await getPurgePreview(selectedYear, selectedScope);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to calculate preview");
      setPreviewData(null);
    } else {
      setPreviewData(res);
    }
    setLoadingPreview(false);
  }

  function handleDownloadPDF() {
    if (!previewData) return;

    generatePurgeArchivePDF({
      year: selectedYear,
      scope: selectedScope,
      generatedDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      superDirector: superDirectorEmail,
      totalRecordsCount: previewData.totalRecords || 0,
      totalMonetaryVolume: previewData.totalVolume,
      recordsSummary: [
        {
          category: "Customer Orders",
          description: "Permanent orders placed in calendar year",
          count: previewData.breakdown?.ordersCount || 0,
        },
        {
          category: "Order Line Items",
          description: "Purchased product lines attached to orders",
          count: previewData.breakdown?.orderItemsCount || 0,
        },
        {
          category: "Stock Reservations",
          description: "Expired or legacy checkout hold records",
          count: previewData.breakdown?.stockReservationsCount || 0,
        },
        {
          category: "Inactive Catalog Products",
          description: "Discontinued or unpublished catalog items",
          count: previewData.breakdown?.inactiveProductsCount || 0,
        },
        {
          category: "Audit Logs",
          description: "Administrative system trace logs",
          count: previewData.breakdown?.auditLogsCount || 0,
        },
      ],
      sampleRecords: previewData.sampleRecords || [],
    });

    setHasDownloadedPdf(true);
  }

  async function handleExecutePurge() {
    if (!isConfirmationMatched || !hasDownloadedPdf) return;

    setIsPurging(true);
    setErrorMessage(null);

    const res = await executeDatabasePurge(selectedYear, selectedScope, confirmationInput);

    if (!res.success) {
      setErrorMessage(res.error || "Purge execution failed");
      setIsPurging(false);
    } else {
      setSuccessMessage(res.message || "Database purge successfully executed");
      setIsPurging(false);
      if (onPurgeSuccess) {
        onPurgeSuccess();
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border-2 border-red-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <Trash2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Database Storage Purge & Archival Console
              </h2>
              <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">
                Super Director Authorization Required
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition"
          >
            <XCircle size={22} />
          </button>
        </div>

        {/* Regulatory Protection Safeguards Notice */}
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl mb-6 text-xs text-amber-900 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <ShieldCheck size={16} className="text-amber-700" />
            <span>Strict Invariant Protection Rules:</span>
          </div>
          <p>
            • <strong>User Profile & Login Immunity:</strong> Customer accounts (`profiles`, `auth.users`) can{" "}
            <span className="underline decoration-amber-400 font-bold">never</span> be deleted.
          </p>
          <p>
            • <strong>12-Month Rolling Retention:</strong> All data from the last 12 rolling months is strictly preserved. Only data older than 12 months is eligible.
          </p>
          <p>
            • <strong>Mandatory Archival:</strong> A complete PDF statement must be downloaded before permanent removal.
          </p>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Step 1: Selection Configuration */}
        {!successMessage && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-500" />
                  Select Calendar Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setPreviewData(null);
                    setHasDownloadedPdf(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none font-semibold text-gray-900"
                >
                  {eligibleYears.map((yr) => (
                    <option key={yr} value={yr}>
                      Year {yr} (&gt; 12 months old)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-gray-500" />
                  Select Data Scope
                </label>
                <select
                  value={selectedScope}
                  onChange={(e) => {
                    setSelectedScope(e.target.value as PurgeScope);
                    setPreviewData(null);
                    setHasDownloadedPdf(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none font-semibold text-gray-900"
                >
                  <option value="transactions">Customer Transactions (Orders & Items)</option>
                  <option value="products">Inactive Product Listings Only</option>
                  <option value="audit">Administrative Audit Logs Only</option>
                  <option value="all">All Eligible Legacy Data</option>
                </select>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculatePreview}
              disabled={loadingPreview}
              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loadingPreview ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Calculating Eligible Records...</span>
                </>
              ) : (
                <span>1. Calculate Eligible Storage Records</span>
              )}
            </button>

            {/* Step 2: Preview Results & Compulsory PDF Download */}
            {previewData && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-xs font-bold text-gray-900">
                    Calculated Records for Year {selectedYear}:
                  </span>
                  <span className="text-sm font-black text-red-600">
                    {previewData.totalRecords?.toLocaleString()} records
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-gray-600">
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="block text-[10px] text-gray-400 uppercase">Orders</span>
                    <span className="font-bold text-gray-900">
                      {previewData.breakdown?.ordersCount}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="block text-[10px] text-gray-400 uppercase">Items</span>
                    <span className="font-bold text-gray-900">
                      {previewData.breakdown?.orderItemsCount}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="block text-[10px] text-gray-400 uppercase">Volume</span>
                    <span className="font-bold text-gray-900">
                      ₦{previewData.totalVolume?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* PDF Download Button */}
                <div className="pt-2">
                  <button
                    onClick={handleDownloadPDF}
                    className={`w-full py-3 px-4 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                      hasDownloadedPdf
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-radiance-goldColor text-white hover:bg-radiance-charcoalTextColor"
                    }`}
                  >
                    <FileDown size={16} />
                    {hasDownloadedPdf
                      ? "✓ PDF Archive Certificate Downloaded (Re-download)"
                      : "2. Download Official PDF Archive Certificate (Mandatory)"}
                  </button>
                  <p className="text-[11px] text-gray-500 text-center mt-1">
                    * The final purge confirmation unlocks only after the PDF archive is downloaded.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation Input & Permanent Purge Execution */}
            {hasDownloadedPdf && previewData && (
              <div className="space-y-4 pt-2 border-t border-gray-100 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    3. Type <span className="text-red-600 font-mono">{expectedPhrase}</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value.toUpperCase())}
                    placeholder={expectedPhrase}
                    className="w-full px-4 py-2.5 border-2 border-red-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-red-500 focus:outline-none uppercase"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecutePurge}
                    disabled={!isConfirmationMatched || isPurging}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  >
                    {isPurging ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Purging Supabase Database...</span>
                      </>
                    ) : (
                      <span>Permanently Purge Records</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {successMessage && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="py-2.5 px-6 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition"
            >
              Close Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
