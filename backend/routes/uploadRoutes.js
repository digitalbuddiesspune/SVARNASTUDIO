import express from "express";
import { uploadProductImagesHandler } from "../controllers/uploadController.js";
import { uploadProductImages } from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/product-images",
  (req, res, next) => {
    uploadProductImages(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Invalid upload" });
      }
      next();
    });
  },
  uploadProductImagesHandler
);

export default router;
