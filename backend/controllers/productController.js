import mongoose from "mongoose";
import Product from "../models/Product.js";

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
    filters.category = {
      $regex: `^${escapeRegex(String(category).trim())}$`,
      $options: "i",
    };
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

  const products = await Product.find(filters).sort(sortBy);
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
      $group: {
        _id: "$category",
        subCategories: { $addToSet: "$subCategory" },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        subCategories: 1,
      },
    },
    {
      $sort: { category: 1 },
    },
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

  const product = await Product.findById(id);
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
