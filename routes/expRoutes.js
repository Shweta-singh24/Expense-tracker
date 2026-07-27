import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  createExp,
  getExps,
  updateExp,
  deleteExp,
  filterExp,
  monthlyReport,
} from "../controllers/expController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense Management APIs
 */

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Grocery Shopping
 *               amount:
 *                 type: number
 *                 example: 1500
 *               category:
 *                 type: string
 *                 example: Food
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-07-16
 *               notes:
 *                 type: string
 *                 example: Weekly grocery shopping
 *               receipt:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, upload.single("receipt"), createExp);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses
 */
router.get("/", protect, getExps);

/**
 * @swagger
 * /api/expenses/filter:
 *   get:
 *     summary: Filter expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         example: Food
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         example: 7
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         example: 2026
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-07-16
 *     responses:
 *       200:
 *         description: Filtered expenses
 */
router.get("/filter", protect, filterExp);

/**
 * @swagger
 * /api/expenses/report:
 *   get:
 *     summary: Get monthly expense report
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         example: 7
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2026
 *     responses:
 *       200:
 *         description: Monthly report generated successfully
 */
router.get("/report", protect, monthlyReport);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6877e7b87cdb6b23d1d5a123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       404:
 *         description: Expense not found
 */
router.put("/:id", protect, updateExp);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6877e7b87cdb6b23d1d5a123
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 */
router.delete("/:id", protect, deleteExp);

export default router;