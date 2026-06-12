import express from "express";
import { uploadProductImagesHandler } from "../controllers/uploadController.js";
import {
  multerUploadErrorMessage,
  uploadProductImages,
} from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/product-images",
  (req, res, next) => {
    uploadProductImages(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: multerUploadErrorMessage(err) });
      }
      next();
    });
  },
  uploadProductImagesHandler
);

export default router;
