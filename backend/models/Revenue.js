import mongoose from "mongoose";

/**
 * Revenue summary per invoice — derived from Invoice (order no, total, date, customer email).
 */
const revenueSchema = new mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      unique: true,
    },
    orderNo: { type: String, trim: true, default: "" },
    grandTotal: { type: Number, required: true, default: 0 },
    orderDate: { type: Date, default: null },
    customerEmail: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

revenueSchema.index({ orderDate: -1 });
revenueSchema.index({ orderNo: 1 });
revenueSchema.index({ customerEmail: 1 });

/** Build revenue fields from an Invoice document or plain object */
revenueSchema.statics.payloadFromInvoice = function (invoice) {
  if (!invoice) return null;
  const d = invoice.toObject ? invoice.toObject() : invoice;
  return {
    invoice: d._id,
    orderNo: String(d.orderNo || "").trim(),
    grandTotal: Number(d.grandTotal) || 0,
    orderDate: d.orderDate || d.createdAt || null,
    customerEmail: String(d.customerEmail || "").trim(),
  };
};

/** Create or update revenue row for an invoice */
revenueSchema.statics.syncFromInvoice = async function (invoice) {
  const data = this.payloadFromInvoice(invoice);
  if (!data?.invoice) return null;
  return this.findOneAndUpdate({ invoice: data.invoice }, data, {
    upsert: true,
    new: true,
    runValidators: true,
  });
};

/** Remove revenue row when invoice is deleted */
revenueSchema.statics.removeForInvoice = async function (invoiceId) {
  if (!invoiceId) return null;
  return this.findOneAndDelete({ invoice: invoiceId });
};

export default mongoose.model("Revenue", revenueSchema);
