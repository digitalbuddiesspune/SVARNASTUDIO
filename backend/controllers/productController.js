import mongoose from "mongoose";
import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ message: "Database not connected. Cannot fetch products." });
  }

  const { category, subCategory } = req.query;
  const filters = {};

  if (category) {
    filters.category = category;
  }

  if (subCategory) {
    filters.subCategory = subCategory;
  }

  const products = await Product.find(filters).sort({ createdAt: -1 });
  return res.json(products);
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
