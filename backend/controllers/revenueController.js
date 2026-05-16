import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Revenue from "../models/Revenue.js";

/** Ensure revenue rows exist for invoices created before sync was added */
async function backfillMissingRevenue() {
  const syncedIds = await Revenue.distinct("invoice");
  const missing = await Invoice.find({ _id: { $nin: syncedIds } }).lean();
  if (missing.length === 0) return;
  await Promise.all(missing.map((inv) => Revenue.syncFromInvoice(inv)));
}

function revenueToClientShape(row) {
  const inv = row.invoice && typeof row.invoice === "object" ? row.invoice : null;
  return {
    id: String(row._id),
    invoiceId: inv?._id ? String(inv._id) : row.invoice ? String(row.invoice) : null,
    orderNo: row.orderNo?.trim() ? row.orderNo : "—",
    grandTotal: Number(row.grandTotal) || 0,
    orderDate: row.orderDate,
    customerEmail: row.customerEmail?.trim() ? row.customerEmail : "—",
    savedAt: row.createdAt,
    invoiceNumber: inv?.invoiceNumber?.trim() ? inv.invoiceNumber : "—",
    customerName: inv?.customerName?.trim() ? inv.customerName : "—",
    customerPhone: inv?.customerPhone?.trim() ? inv.customerPhone : "—",
    orderDateDisplay: inv?.orderDateDisplay?.trim()
      ? inv.orderDateDisplay
      : inv?.invoiceDateTime?.trim()
        ? inv.invoiceDateTime
        : "—",
  };
}

export const getAllRevenue = async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected. Cannot fetch revenue." });
  }

  try {
    await backfillMissingRevenue();

    const rows = await Revenue.find()
      .populate(
        "invoice",
        "invoiceNumber customerName customerPhone customerEmail orderDateDisplay invoiceDateTime"
      )
      .sort({ orderDate: -1, createdAt: -1 })
      .lean();

    return res.json(rows.map(revenueToClientShape));
  } catch (error) {
    console.error("All revenue error:", error);
    return res.status(500).json({ message: error.message || "Failed to load revenue" });
  }
};

export const getDashboardSummary = async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected. Cannot load dashboard stats." });
  }

  try {
    await backfillMissingRevenue();

    const [result] = await Revenue.aggregate([
      {
        $group: {
          _id: null,
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: "$grandTotal" },
        },
      },
    ]);

    return res.json({
      orderCount: result?.orderCount ?? 0,
      totalRevenue: result?.totalRevenue ?? 0,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return res.status(500).json({ message: error.message || "Failed to load dashboard stats" });
  }
};
