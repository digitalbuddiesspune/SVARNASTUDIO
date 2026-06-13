import multer from "multer";

export const MAX_IMAGE_COUNT = 10;

export function multerUploadErrorMessage(err) {
  if (!err) return "Invalid upload";
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
  limits: { files: MAX_IMAGE_COUNT },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  },
});

export const uploadProductImages = upload.array("images", 10);
