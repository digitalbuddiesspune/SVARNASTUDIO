import mongoose from "mongoose";
import Category from "../models/category.js";
import Product from "../models/Product.js";

function normalizeSubCategories(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  const out = [];
  for (const item of input) {
    const t = String(item ?? "").trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t);
  }
  return out;
}

export const getCategories = async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected." });
  }
  const list = await Category.find().sort({ name: 1 }).lean();
  return res.json(list);
};

export const createCategory = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected." });
  }
  const { name, imageUrl = "", subCategories } = req.body || {};
  const trimmed = String(name || "").trim();
  if (!trimmed) {
    return res.status(400).json({ message: "Category name is required." });
  }
  try {
    const created = await Category.create({
      name: trimmed,
      imageUrl: String(imageUrl || "").trim(),
      subCategories: normalizeSubCategories(subCategories),
    });
    return res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A category with this name already exists." });
    }
    return res.status(400).json({ message: err.message || "Could not create category." });
  }
};

export const deleteCategory = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected." });
  }
  const { id } = req.params;
  const count = await Product.countDocuments({ category: id });
  if (count > 0) {
    return res.status(400).json({
      message: `Cannot delete: ${count} product(s) still use this category. Reassign or delete them first.`,
    });
  }
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ message: "Category not found." });
  }
  return res.json({ message: "Category deleted." });
};

export const updateCategory = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected." });
  }
  const { id } = req.params;
  const { name, imageUrl, subCategories } = req.body || {};
  const updates = {};
  if (name !== undefined) {
    const t = String(name).trim();
    if (!t) return res.status(400).json({ message: "Category name cannot be empty." });
    updates.name = t;
  }
  if (imageUrl !== undefined) {
    updates.imageUrl = String(imageUrl || "").trim();
  }
  if (subCategories !== undefined) {
    updates.subCategories = normalizeSubCategories(subCategories);
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No fields to update." });
  }
  try {
    const updated = await Category.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A category with this name already exists." });
    }
    return res.status(400).json({ message: err.message || "Could not update category." });
  }
};
