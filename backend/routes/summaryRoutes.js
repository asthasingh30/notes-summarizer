import express from "express";
import { createSummary, getSummaries, deleteSummary } from "../controllers/summaryController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here require a logged-in user
router.use(protect);

router.post("/summarise", createSummary);
router.get("/summaries", getSummaries);
router.delete("/summaries/:id", deleteSummary);

export default router;
