import "dotenv/config";
import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "SVARNA STUDIO backend is running" });
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/upload", uploadRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
