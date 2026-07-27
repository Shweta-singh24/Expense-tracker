import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadProfileImage as uploadMiddleware } from "../middleware/profileUpload.js";
import { updateProfileValidation, changePasswordValidation } from "../validators/profileValidators.js";
import {
  getMyProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  changePassword,
  getProfileActivity,
} from "../controllers/profileController.js";

const router = express.Router();

// All profile routes require a valid JWT
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get logged-in user's full profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", getMyProfile);

/**
 * @swagger
 * /api/profile/update:
 *   put:
 *     summary: Update personal profile fields
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Shweta Singh
 *               phone:
 *                 type: string
 *                 example: "+91 9876543210"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1998-05-15"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               address:
 *                 type: string
 *                 example: "123 Main Street, Mumbai"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       422:
 *         description: Validation failed
 */
router.put("/update", updateProfileValidation, updateProfile);

/**
 * @swagger
 * /api/profile/upload-image:
 *   post:
 *     summary: Upload or replace profile image (JPG/PNG, max 2MB)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid file type or size exceeded
 */
router.post("/upload-image", uploadMiddleware, uploadProfileImage);

/**
 * @swagger
 * /api/profile/delete-image:
 *   delete:
 *     summary: Delete profile image
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: No profile image to delete
 */
router.delete("/delete-image", deleteProfileImage);

/**
 * @swagger
 * /api/profile/change-password:
 *   put:
 *     summary: Change account password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: OldPass@123
 *               newPassword:
 *                 type: string
 *                 example: NewPass@456
 *               confirmPassword:
 *                 type: string
 *                 example: NewPass@456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 *       422:
 *         description: Validation failed
 */
router.put("/change-password", changePasswordValidation, changePassword);

/**
 * @swagger
 * /api/profile/activity:
 *   get:
 *     summary: Get profile activity log
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity fetched successfully
 */
router.get("/activity", getProfileActivity);

export default router;
