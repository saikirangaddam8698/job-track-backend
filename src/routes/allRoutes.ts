import { Router } from "express";
import authRoutes from "../routes/auth.routes";

const router = Router();
router.use("/api/auth",authRoutes);

export default router;