import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createExp,
  getExps,
  updateExp,
  deleteExp,
  filterExp,
  monthlyReport,
} from "../controllers/expController.js";

const router = express.Router();

router.post("/", authMiddleware, createExp);
router.get("/", authMiddleware, getExps);
router.get("/filter", authMiddleware, filterExp);
router.get("/report", authMiddleware, monthlyReport);
router.put("/:id", authMiddleware, updateExp);
router.delete("/:id", authMiddleware, deleteExp);

export default router;
