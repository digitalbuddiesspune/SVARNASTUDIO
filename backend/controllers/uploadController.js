import cloudinary, {
  ensureCloudinaryConfigured,
  isCloudinaryConfigured,
} from "../config/cloudinary.js";

function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export const uploadProductImagesHandler = async (req, res) => {
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      message:
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend .env",
    });
  }

  const files = req.files || [];
  if (files.length === 0) {
    return res.status(400).json({ message: "No images provided" });
  }

  try {
    ensureCloudinaryConfigured();
    const folder = process.env.CLOUDINARY_PRODUCT_FOLDER || "svarnastudio/products";
    const results = await Promise.all(
      files.map((file) => uploadBuffer(file.buffer, folder))
    );
    return res.json({
      urls: results.map((r) => r.secure_url).filter(Boolean),
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({
      message: error.message || "Image upload failed",
    });
  }
};
