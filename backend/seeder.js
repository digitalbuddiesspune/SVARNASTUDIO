/**
 * Seed sample categories + products (expects ./data/products.js with category as ObjectId or legacy string).
 * For fresh DB: creates categories from unique names in product data, then inserts products with refs.
 */
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Category from "./models/category.js";
import Product from "./models/Product.js";

dotenv.config();

async function seedProducts() {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      throw new Error("MONGO_URI is required to run seed script.");
    }

    let productsData = [];
    try {
      const mod = await import("./data/products.js");
      productsData = mod.default || mod.products || [];
    } catch {
      console.warn("No ./data/products.js found — seeding categories only.");
    }

    await Product.deleteMany({});
    await Category.deleteMany({});

    const nameToSubs = new Map();
    for (const p of productsData) {
      const raw = p.category;
      const name =
        typeof raw === "string"
          ? raw.trim()
          : raw && typeof raw === "object" && raw.name
            ? String(raw.name).trim()
            : "";
      if (!name) continue;
      if (!nameToSubs.has(name)) nameToSubs.set(name, new Set());
      const sub = String(p.subCategory || "").trim();
      if (sub) nameToSubs.get(name).add(sub);
    }

    const nameToId = new Map();
    for (const [name, subs] of nameToSubs) {
      const doc = await Category.create({
        name,
        imageUrl: "",
        subCategories: [...subs],
      });
      nameToId.set(name, doc._id);
    }

    if (productsData.length) {
      const normalized = productsData.map((p) => {
        const raw = p.category;
        const name =
          typeof raw === "string"
            ? raw.trim()
            : raw && typeof raw === "object" && raw.name
              ? String(raw.name).trim()
              : "";
        const id = nameToId.get(name);
        if (!id) {
          throw new Error(`Missing category for product: ${p.productName} (category: ${name})`);
        }
        return { ...p, category: id };
      });
      await Product.insertMany(normalized);
    }

    console.log("Seed complete. Categories:", nameToId.size, "Products:", productsData.length);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seedProducts();
