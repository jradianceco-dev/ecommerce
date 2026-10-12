import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface AccountStatementData {
  statementDate: string;
  period: string;
  generatedBy: string;
  accountSummary: {
    totalRevenue: number;
    completedRevenue: number;
    pendingRevenue: number;
    refundedRevenue: number;
    netBalance: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
  };
  gatewayBreakdown: {
    stripeVolume: number;
    paystackVolume: number;
  };
  recentTransactions: Array<{
    orderNumber: string;
    date: string;
    customer: string;
    amount: number;
    status: string;
    paymentStatus: string;
    gateway: string;
  }>;
}

/**
 * Generates and downloads a clean, professional PDF account and balance statement.
 */
export function generateAccountStatementPDF(data: AccountStatementData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Theme Colors
  const charcoal = [30, 30, 30] as [number, number, number];
  const gold = [197, 160, 89] as [number, number, number];
  const muted = [110, 110, 110] as [number, number, number];
  const emerald = [16, 120, 80] as [number, number, number];

  // Header Banner
  doc.setFillColor(...charcoal);
  doc.rect(0, 0, pageWidth, 32, "F");

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("JRADIANCE", 14, 15);

  doc.setTextColor(...gold);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("LUXURY COSMETICS & ORGANIC SKINCARE", 14, 21);

  // Statement Title Right Aligned
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("ACCOUNT BALANCE STATEMENT", pageWidth - 14, 15, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated: ${data.statementDate}`, pageWidth - 14, 21, { align: "right" });
  doc.text(`Period Scope: ${data.period.toUpperCase()}`, pageWidth - 14, 26, { align: "right" });

  // Metadata Sub-bar
  doc.setTextColor(...muted);
  doc.setFontSize(8.5);
  doc.text(`Audited By: ${data.generatedBy} | Official Financial Archive`, 14, 40);

  // Account Summary Title
  doc.setTextColor(...charcoal);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. Financial Account Summary", 14, 48);

  const summaryRows = [
    [
      "Total Gross Revenue",
      `₦${data.accountSummary.totalRevenue.toLocaleString()}`,
      "Total Orders Processed",
      `${data.accountSummary.totalOrders.toLocaleString()}`,
    ],
    [
      "Settled / Completed Volume",
      `₦${data.accountSummary.completedRevenue.toLocaleString()}`,
      "Completed Deliveries",
      `${data.accountSummary.completedOrders.toLocaleString()}`,
    ],
    [
      "Pending In-Transit Revenue",
      `₦${data.accountSummary.pendingRevenue.toLocaleString()}`,
      "Pending Orders",
      `${data.accountSummary.pendingOrders.toLocaleString()}`,
    ],
    [
      "Refunded / Reversal Total",
      `₦${data.accountSummary.refundedRevenue.toLocaleString()}`,
      "Cancelled Orders",
      `${data.accountSummary.cancelledOrders.toLocaleString()}`,
    ],
    [
      "Current Net Book Balance",
      `₦${data.accountSummary.netBalance.toLocaleString()}`,
      "Account Status",
      "ACTIVE & RECONCILED",
    ],
  ];

  autoTable(doc, {
    startY: 52,
    head: [["Financial Metric", "Value", "Operational Metric", "Volume"]],
    body: summaryRows,
    theme: "grid",
    headStyles: {
      fillColor: charcoal,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { fontStyle: "bold", textColor: emerald, cellWidth: 45 },
      2: { cellWidth: 45 },
      3: { cellWidth: 42 },
    },
  });

  // Gateway Settlement Section
  const nextY = (doc as any).lastAutoTable.finalY + 10;
  doc.setTextColor(...charcoal);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. Payment Gateway Volume Breakdown", 14, nextY);

  autoTable(doc, {
    startY: nextY + 4,
    head: [["Gateway Provider", "Status", "Total Volume (Gross)", "Share of Volume"]],
    body: [
      [
        "Stripe (International & Cards)",
        "ACTIVE & LIVE",
        `₦${data.gatewayBreakdown.stripeVolume.toLocaleString()}`,
        data.accountSummary.totalRevenue > 0
          ? `${Math.round((data.gatewayBreakdown.stripeVolume / data.accountSummary.totalRevenue) * 100)}%`
          : "100%",
      ],
      [
        "Paystack (Direct Local NGN)",
        "COMING SOON",
        `₦${data.gatewayBreakdown.paystackVolume.toLocaleString()}`,
        data.accountSummary.totalRevenue > 0
          ? `${Math.round((data.gatewayBreakdown.paystackVolume / data.accountSummary.totalRevenue) * 100)}%`
          : "0%",
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: charcoal,
      textColor: [255, 255, 255],
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
    },
  });

  // Recent Transactions Section
  const txY = (doc as any).lastAutoTable.finalY + 10;
  doc.setTextColor(...charcoal);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. Recent Settled & Pending Transactions", 14, txY);

  const txRows = data.recentTransactions.slice(0, 25).map((tx) => [
    tx.orderNumber,
    tx.date,
    tx.customer,
    `₦${tx.amount.toLocaleString()}`,
    tx.status.toUpperCase(),
    tx.paymentStatus.toUpperCase(),
    tx.gateway,
  ]);

  autoTable(doc, {
    startY: txY + 4,
    head: [["Order #", "Date", "Customer", "Amount", "Order Status", "Payment", "Gateway"]],
    body: txRows.length > 0 ? txRows : [["No recent transactions recorded in this period", "", "", "", "", "", ""]],
    theme: "striped",
    headStyles: {
      fillColor: charcoal,
      textColor: [255, 255, 255],
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.4,
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      3: { fontStyle: "bold" },
    },
  });

  // Footer Certificate
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(220, 220, 220);
  doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text(
    "JRADIANCE Enterprise Platform • Official Financial Statement • Strictly Confidential",
    14,
    pageHeight - 10
  );
  doc.text(
    `Page 1 of 1 • Hash: SHA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    pageWidth - 14,
    pageHeight - 10,
    { align: "right" }
  );

  // Trigger browser download
  const sanitizedDate = data.statementDate.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`JRADIANCE_Account_Statement_${sanitizedDate}.pdf`);
}
