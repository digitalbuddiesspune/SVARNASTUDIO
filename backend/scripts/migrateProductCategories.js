/**
 * One-time migration: converts Product.category from string to ObjectId refs.
 * Run: node backend/scripts/migrateProductCategories.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/category.js";
import Product from "../models/Product.js";

dotenv.config();

async function run() {
  const ok = await connectDB();
  if (!ok) {
    console.error("DB connection failed");
    process.exit(1);
  }

  const raw = await mongoose.connection.db.collection("products").find({}).toArray();

  let created = 0;
  const nameToId = new Map();

  for (const doc of raw) {
    const c = doc.category;
    if (c && mongoose.isValidObjectId(String(c))) {
      nameToId.set(String(c), String(c));
      continue;
    }
    const name = typeof c === "string" ? c.trim() : "";
    if (!name) continue;
    if (!nameToId.has(name)) {
      let cat = await Category.findOne({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
      if (!cat) {
        cat = await Category.create({ name, imageUrl: "" });
        created += 1;
        console.log("Created category:", name);
      }
      nameToId.set(name, String(cat._id));
    }
  }

  for (const doc of raw) {
    const c = doc.category;
    if (c && mongoose.isValidObjectId(String(c))) continue;
    const name = typeof c === "string" ? c.trim() : "";
    const id = nameToId.get(name);
    if (!id) continue;
    await mongoose.connection.db.collection("products").updateOne({ _id: doc._id }, { $set: { category: new mongoose.Types.ObjectId(id) } });
  }

  console.log("Migration done. New categories created:", created);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
