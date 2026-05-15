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
