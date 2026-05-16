import express from "express";
import { getAllRevenue, getDashboardSummary } from "../controllers/revenueController.js";

const router = express.Router();

router.get("/", getAllRevenue);
router.get("/dashboard", getDashboardSummary);

export default router;
