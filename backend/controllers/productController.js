import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/category.js";

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getProducts = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ message: "Database not connected. Cannot fetch products." });
  }

  const { category, subCategory, sort = "latest" } = req.query;
  const filters = {};

  if (category) {
    const catStr = String(category).trim();
    if (mongoose.isValidObjectId(catStr)) {
      filters.category = catStr;
    } else {
      const catDoc = await Category.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(catStr)}$`, "i") },
      }).select("_id");
      if (catDoc) {
        filters.category = catDoc._id;
      } else {
        filters._id = { $in: [] };
      }
    }
  }

  if (subCategory) {
    filters.subCategory = {
      $regex: `^${escapeRegex(String(subCategory).trim())}$`,
      $options: "i",
    };
  }

  let sortBy = { createdAt: -1 };
  if (sort === "priceAsc") sortBy = { "price.discountedPrice": 1 };
  if (sort === "priceDesc") sortBy = { "price.discountedPrice": -1 };
  if (sort === "nameAsc") sortBy = { productName: 1 };
  if (sort === "nameDesc") sortBy = { productName: -1 };

  const products = await Product.find(filters)
    .populate("category", "name imageUrl subCategories")
    .sort(sortBy);
  return res.json(products);
};

export const getCategoryFilters = async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ message: "Database not connected. Cannot fetch categories." });
  }

  const groupedFilters = await Product.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "catDoc",
      },
    },
    { $unwind: { path: "$catDoc", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$category",
        subCategories: { $addToSet: "$subCategory" },
        categoryName: { $first: "$catDoc.name" },
      },
    },
    {
      $project: {
        _id: 0,
        categoryId: "$_id",
        category: { $ifNull: ["$categoryName", "Unknown"] },
        subCategories: 1,
      },
    },
    { $sort: { category: 1 } },
  ]);

  return res.json(groupedFilters);
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ message: "Database not connected. Cannot fetch product." });
  }

  const product = await Product.findById(id).populate("category", "name imageUrl subCategories");
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
};

export const createProduct = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ message: "Database not connected. Cannot create product." });
  }

  const createdProduct = await Product.create(req.body);
  return res.status(201).json(createdProduct);
};

export const updateProduct = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ message: "Database not connected. Cannot update product." });
  }

  const { id } = req.params;
  const payload = { ...req.body };

  if (payload.price && typeof payload.price === "object") {
    const mrp = Number(payload.price.mrp ?? 0);
    const discountPercent = Number(payload.price.discountPercent ?? 0);

    payload.price.mrp = Number.isFinite(mrp) ? mrp : 0;
    payload.price.discountPercent = Number.isFinite(discountPercent) ? discountPercent : 0;
    payload.price.discountedPrice =
      payload.price.mrp - (payload.price.mrp * payload.price.discountPercent) / 100;
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!updatedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(updatedProduct);
};

export const deleteProduct = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ message: "Database not connected. Cannot delete product." });
  }

  const { id } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ message: "Product deleted successfully" });
};
