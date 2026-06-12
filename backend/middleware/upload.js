import multer from "multer";

export const MAX_IMAGE_SIZE_MB = 8;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_IMAGE_COUNT = 10;

export function multerUploadErrorMessage(err) {
  if (!err) return "Invalid upload";
  if (err.code === "LIMIT_FILE_SIZE") {
    return `Each image must be ${MAX_IMAGE_SIZE_MB} MB or smaller.`;
  }
  if (err.code === "LIMIT_FILE_COUNT") {
    return `You can upload up to ${MAX_IMAGE_COUNT} images at a time.`;
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return "Invalid file field. Use the image upload input.";
  }
  return err.message || "Invalid upload";
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: MAX_IMAGE_COUNT },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  },
});

export const uploadProductImages = upload.array("images", 10);
