import express from "express";
import {
  createProduct,
  getCategoryFilters,
  getProductById,
  getProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/filters", getCategoryFilters);
router.route("/").get(getProducts).post(createProduct);
router.route("/:id").get(getProductById);

export default router;
