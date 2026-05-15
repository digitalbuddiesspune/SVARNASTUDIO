import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Revenue from "../models/Revenue.js";

const COMPANY_DEFAULTS = {
  companyName: "Svarna Studio",
  companyPhones: ["+91 73504 95906", "+91 86686 56703"],
  companyEmail: "contact@svarnastudio.in",
  companyAddress: "Ganesha Residency, Bhole Baba Nagar,\nUday Nagar, Nagpur",
};

function parseAmount(raw) {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function formatInvoiceDateTime(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

async function getNextInvoiceNumber() {
  const last = await Invoice.findOne().sort({ invoiceSeq: -1 }).select("invoiceSeq");
  const nextSeq = (last?.invoiceSeq ?? 0) + 1;
  return {
    invoiceSeq: nextSeq,
    invoiceNumber: `INV-${String(nextSeq).padStart(2, "0")}`,
  };
}

function normalizeLineItems(rawItems = []) {
  return rawItems
    .filter((row) => String(row?.name || "").trim())
    .map((row) => ({
      lineId: String(row.lineId || row.id || "").trim() || undefined,
      productId:
        row.productId && mongoose.Types.ObjectId.isValid(row.productId)
          ? row.productId
          : null,
      name: String(row.name).trim(),
      category: String(row.category || "").trim(),
      mrp: parseAmount(row.mrp),
      discountedPrice: parseAmount(row.discountedPrice),
    }));
}

function computeTotals(lineItems) {
  const subtotal = lineItems.reduce(
    (sum, row) => sum + (row.discountedPrice ?? 0),
    0
  );
  const gstAmount = subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;
  return { subtotal, gstAmount, grandTotal };
}

function buildInvoicePayload(body, { invoiceSeq, invoiceNumber, isUpdate = false }) {
  const lineItems = normalizeLineItems(body.lineItems || body.rows || []);
  if (lineItems.length === 0) {
    const err = new Error("At least one product with a name is required");
    err.statusCode = 400;
    throw err;
  }

  const customerName = String(body.customerName || "").trim();
  if (!customerName) {
    const err = new Error("Customer name is required");
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const orderDateRaw = body.orderDate;
  const orderDate =
    orderDateRaw && !Number.isNaN(new Date(orderDateRaw).getTime())
      ? new Date(orderDateRaw)
      : null;

  const orderDateDisplay = orderDate
    ? formatInvoiceDateTime(orderDate)
    : String(body.orderDateDisplay || "—").trim() || "—";

  const totals = computeTotals(lineItems);

  const payload = {
    logoDataUrl: String(body.logoDataUrl || "").trim(),
    companyName: String(body.companyName || COMPANY_DEFAULTS.companyName).trim(),
    companyPhones: Array.isArray(body.companyPhones)
      ? body.companyPhones.map((p) => String(p).trim()).filter(Boolean)
      : [...COMPANY_DEFAULTS.companyPhones],
    companyEmail: String(body.companyEmail || COMPANY_DEFAULTS.companyEmail).trim(),
    companyAddress: String(body.companyAddress || COMPANY_DEFAULTS.companyAddress).trim(),
    customerName,
    customerEmail: String(body.customerEmail || "").trim(),
    customerPhone: String(body.customerPhone || "").trim(),
    customerAddress: String(body.customerAddress || "").trim(),
    orderNo: String(body.orderNo || "").trim(),
    orderDate,
    orderDateDisplay,
    orderStatus: String(body.orderStatus || "").trim(),
    paymentStatus: String(body.paymentStatus || "").trim(),
    paymentMode: String(body.paymentMode || "").trim(),
    upiId: String(body.upiId || "").trim(),
    lineItems,
    ...totals,
  };

  if (!isUpdate) {
    payload.invoiceSeq = invoiceSeq;
    payload.invoiceNumber = invoiceNumber;
    payload.invoiceDateTime = formatInvoiceDateTime(now);
  } else if (body.invoiceDateTime) {
    payload.invoiceDateTime = String(body.invoiceDateTime).trim();
  }

  return payload;
}

/** Map MongoDB document → frontend invoice preview shape */
export function invoiceToClientShape(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : doc;
  return {
    _id: String(d._id),
    companyName: d.companyName,
    logoDataUrl: d.logoDataUrl,
    companyPhones: d.companyPhones || [],
    companyEmail: d.companyEmail,
    companyAddress: d.companyAddress,
    customerName: d.customerName,
    customerEmail: d.customerEmail,
    customerPhone: d.customerPhone,
    customerAddress: d.customerAddress,
    invoiceDateTime: d.invoiceDateTime,
    orderNo: d.orderNo?.trim() ? d.orderNo : "—",
    invoiceNumber: d.invoiceNumber,
    orderDateDisplay: d.orderDateDisplay?.trim() ? d.orderDateDisplay : "—",
    orderStatus: d.orderStatus?.trim() ? d.orderStatus : "—",
    paymentStatus: d.paymentStatus?.trim() ? d.paymentStatus : "—",
    paymentMode: d.paymentMode?.trim() ? d.paymentMode : "—",
    upiId: d.upiId || "",
    rows: (d.lineItems || []).map((row, index) => ({
      id: row.lineId || `row-${index}`,
      name: row.name,
      category: row.category || "",
      mrp: row.mrp,
      discountedPrice: row.discountedPrice,
    })),
    subtotal: d.subtotal,
    gstAmount: d.gstAmount,
    grandTotal: d.grandTotal,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export const getInvoices = async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected. Cannot fetch invoices." });
  }

  const invoices = await Invoice.find().sort({ createdAt: -1 });
  return res.json(
    invoices.map((inv) => ({
      id: String(inv._id),
      savedAt: inv.createdAt,
      invoice: invoiceToClientShape(inv),
    }))
  );
};

export const getInvoiceByNumber = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected. Cannot fetch invoice." });
  }

  const invoiceNumber = decodeURIComponent(req.params.invoiceNumber || "").trim();
  const invoice = await Invoice.findOne({ invoiceNumber });
  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  return res.json(invoiceToClientShape(invoice));
};

export const getInvoiceByOrderNo = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected. Cannot fetch invoice." });
  }

  const orderNo = decodeURIComponent(req.params.orderNo || "").trim();
  if (!orderNo) {
    return res.status(400).json({ message: "Order number is required" });
  }

  const invoice = await Invoice.findOne({ orderNo }).sort({ createdAt: -1 });
  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found for this order number" });
  }

  return res.json(invoiceToClientShape(invoice));
};

export const getInvoiceById = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected. Cannot fetch invoice." });
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid invoice id" });
  }

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  return res.json(invoiceToClientShape(invoice));
};

export const createInvoice = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected. Cannot create invoice." });
  }

  try {
    const { invoiceSeq, invoiceNumber } = await getNextInvoiceNumber();
    const payload = buildInvoicePayload(req.body, { invoiceSeq, invoiceNumber });
    const created = await Invoice.create(payload);
    await Revenue.syncFromInvoice(created);
    return res.status(201).json(invoiceToClientShape(created));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || "Failed to create invoice" });
  }
};

export const updateInvoice = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected. Cannot update invoice." });
  }

  const { id } = req.params;

  try {
    const existing = await Invoice.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const payload = buildInvoicePayload(
      { ...req.body, invoiceDateTime: existing.invoiceDateTime },
      { isUpdate: true }
    );

    const updated = await Invoice.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    await Revenue.syncFromInvoice(updated);
    return res.json(invoiceToClientShape(updated));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || "Failed to update invoice" });
  }
};

export const deleteInvoice = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected. Cannot delete invoice." });
  }

  const deleted = await Invoice.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  await Revenue.removeForInvoice(deleted._id);
  return res.json({ message: "Invoice deleted successfully" });
};
