import express from "express";
import { body, validationResult } from "express-validator";
import { signup, login, refreshTokenHandler, logout } from "../controllers/authController.js";

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Shweta
 *               email:
 *                 type: string
 *                 example: shweta@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/signup",
  [
    body("name").isLength({ min: 1 }).withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password min 8 chars"),
  ],
  handleValidation,
  signup
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: shweta@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").exists().withMessage("Password required"),
  ],
  handleValidation,
  login
);

// refresh and logout
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Generate a new access token using refresh token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Access token generated successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post("/refresh", refreshTokenHandler);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", logout);

export default router;
