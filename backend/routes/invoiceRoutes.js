import express from "express";
import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoiceByNumber,
  getInvoiceByOrderNo,
  getInvoices,
  updateInvoice,
} from "../controllers/invoiceController.js";

const router = express.Router();

router.route("/").get(getInvoices).post(createInvoice);
router.get("/order/:orderNo", getInvoiceByOrderNo);
router.get("/number/:invoiceNumber", getInvoiceByNumber);
router.route("/:id").get(getInvoiceById).put(updateInvoice).delete(deleteInvoice);

export default router;
