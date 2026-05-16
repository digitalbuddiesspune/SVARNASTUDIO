import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  {
    lineId: { type: String, trim: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    name: { type: String, trim: true, required: true },
    category: { type: String, trim: true, default: "" },
    mrp: { type: Number, default: null },
    discountedPrice: { type: Number, default: null },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceSeq: { type: Number, unique: true, sparse: true },
    invoiceNumber: { type: String, required: true, unique: true, trim: true },

    logoDataUrl: { type: String, default: "" },

    companyName: { type: String, trim: true, default: "Svarna Studio" },
    companyPhones: [{ type: String, trim: true }],
    companyEmail: { type: String, trim: true, default: "" },
    companyAddress: { type: String, trim: true, default: "" },

    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, default: "" },
    customerPhone: { type: String, trim: true, default: "" },
    customerAddress: { type: String, trim: true, default: "" },

    orderNo: { type: String, trim: true, default: "" },
    orderDate: { type: Date, default: null },
    orderDateDisplay: { type: String, trim: true, default: "" },
    invoiceDateTime: { type: String, trim: true, default: "" },

    orderStatus: { type: String, trim: true, default: "" },
    paymentStatus: { type: String, trim: true, default: "" },
    paymentMode: { type: String, trim: true, default: "" },
    upiId: { type: String, trim: true, default: "" },
    gstPercent: { type: Number, default: 0, min: 0, max: 100 },

    lineItems: {
      type: [lineItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one product line is required",
      },
    },

    subtotal: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ customerName: 1 });

export default mongoose.model("Invoice", invoiceSchema);
