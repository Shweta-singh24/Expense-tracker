import express from "express";
import { body, validationResult } from "express-validator";
import { signup, login, refreshTokenHandler, logout } from "../controllers/authController.js";

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

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
router.post("/refresh", refreshTokenHandler);
router.post("/logout", logout);

export default router;
