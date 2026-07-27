import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";
import { errorResponse } from "../utils/apiResponse.js";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

// ─── Storage: Cloudinary (production) ────────────────────────────────────────
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: (req) => ({
    folder: "expenseflow/profile_images",
    allowed_formats: ["jpg", "jpeg", "png"],
    // Unique filename per user so re-uploads overwrite cleanly
    public_id: `user_${req.user._id}_${Date.now()}`,
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  }),
});

// ─── Storage: Local disk (development fallback) ───────────────────────────────
const localStorageEngine = multer.diskStorage({
  destination: "uploads/profiles/",
  filename: (req, file, cb) => cb(null, `user_${req.user._id}_${Date.now()}_${file.originalname}`),
});

const storage =
  process.env.NODE_ENV === "production" ? cloudinaryStorage : localStorageEngine;

// ─── File filter ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only JPG, JPEG, and PNG images are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
});

/**
 * Multer middleware for single profile image upload.
 * Wraps multer errors into the standard API error format.
 */
export const uploadProfileImage = (req, res, next) => {
  upload.single("profileImage")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return errorResponse(res, 400, "Image size must not exceed 2MB");
    }
    return errorResponse(res, 400, err.message || "File upload error");
  });
};
