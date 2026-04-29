import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productsData from "./data/products.js";
import Product from "./models/Product.js";

dotenv.config();

const seedProducts = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      throw new Error("MONGO_URI is required to run seed script.");
    }

    await Product.deleteMany();
    await Product.insertMany(productsData);

    console.log("Products seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedProducts();
