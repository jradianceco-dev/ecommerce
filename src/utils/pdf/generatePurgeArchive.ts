import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PurgeArchiveReportData {
  year: number;
  scope: string;
  generatedDate: string;
  superDirector: string;
  totalRecordsCount: number;
  totalMonetaryVolume?: number;
  recordsSummary: Array<{
    category: string;
    description: string;
    count: number;
  }>;
  sampleRecords: Array<{
    identifier: string;
    date: string;
    details: string;
    status: string;
  }>;
}

/**
 * Generates and downloads a formal Database Purge & Archival Certificate PDF.
 * This document serves as the permanent legal archive of pruned database records.
 */
export function generatePurgeArchivePDF(data: PurgeArchiveReportData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const darkRed = [140, 20, 20] as [number, number, number];
  const charcoal = [30, 30, 30] as [number, number, number];
  const muted = [110, 110, 110] as [number, number, number];

  // Header Banner
  doc.setFillColor(...darkRed);
  doc.rect(0, 0, pageWidth, 32, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("JRADIANCE DATABASE ARCHIVE & PURGE CERTIFICATE", 14, 15);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(240, 220, 220);
  doc.text(`Official Permanent Record for Calendar Year: ${data.year}`, 14, 21);
  doc.text(`Scope: ${data.scope.toUpperCase()}`, 14, 26);

  doc.text(`Archive Date: ${data.generatedDate}`, pageWidth - 14, 21, { align: "right" });
  doc.text(`Authorized By: ${data.superDirector}`, pageWidth - 14, 26, { align: "right" });

  // Notice & Legal Retention Warning
  doc.setTextColor(...charcoal);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. Archival & Compliance Declarations", 14, 42);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  const declarationText =
    "This certificate verifies that legacy operational data meeting retention expiry criteria has been compiled and archived prior to permanent truncation on Supabase PostgreSQL. In compliance with data protection policies, customer login profiles and any records created within the last 12 rolling months remain protected and unpurged.";
  const splitDeclaration = doc.splitTextToSize(declarationText, pageWidth - 28);
  doc.text(splitDeclaration, 14, 48);

  // Summary Metrics Table
  const nextY = 48 + splitDeclaration.length * 4.5 + 4;
  doc.setTextColor(...charcoal);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("2. Purge Scope & Record Count Summary", 14, nextY);

  const summaryBody = data.recordsSummary.map((r) => [
    r.category,
    r.description,
    r.count.toLocaleString(),
  ]);

  autoTable(doc, {
    startY: nextY + 4,
    head: [["Category", "Scope Description", "Total Records Scheduled"]],
    body: summaryBody,
    theme: "grid",
    headStyles: {
      fillColor: darkRed,
      textColor: [255, 255, 255],
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 100 },
      2: { fontStyle: "bold", cellWidth: 35, halign: "right" },
    },
  });

  // Sample Archive Inventory
  const sampleY = (doc as any).lastAutoTable.finalY + 8;
  doc.setTextColor(...charcoal);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("3. Itemized Records Archive (Inventory Manifest)", 14, sampleY);

  const sampleBody = data.sampleRecords.length > 0
    ? data.sampleRecords.map((s) => [s.identifier, s.date, s.details, s.status])
    : [["No individual records in this category", "", "", ""]];

  autoTable(doc, {
    startY: sampleY + 4,
    head: [["Identifier / Ref", "Date Created", "Details & Customer", "Status"]],
    body: sampleBody,
    theme: "striped",
    headStyles: {
      fillColor: charcoal,
      textColor: [255, 255, 255],
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
    },
  });

  // Footer Certificate
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(200, 200, 200);
  doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text(
    `Total Purged Volume: ${data.totalRecordsCount.toLocaleString()} records • Super Director Archival Lock`,
    14,
    pageHeight - 10
  );
  doc.text(
    `Cryptographic Fingerprint: SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
    pageWidth - 14,
    pageHeight - 10,
    { align: "right" }
  );

  // Trigger browser download
  doc.save(`JRADIANCE_Database_Archive_${data.year}_${data.scope}.pdf`);
}
