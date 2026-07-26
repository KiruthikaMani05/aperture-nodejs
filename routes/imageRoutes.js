import { Router } from "express";
import {
  getImages,
  getImageById,
  searchImages,
  filterImages,
  createImage,
  updateImage,
  deleteImage,
  bulkDeleteImages,
  getAllImagesAdmin,
  getStats,
} from "../controllers/imageController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../utils/upload.js";

const router = Router();

// --- Public ---
router.get("/search", searchImages);
router.get("/filter", filterImages);
router.get("/", getImages);

// --- Admin (order matters: specific paths before /:id) ---
router.get("/admin/all", protect, getAllImagesAdmin);
router.get("/admin/stats", protect, getStats);
router.post("/", protect, upload.single("image"), createImage);
router.delete("/bulk", protect, bulkDeleteImages);

router.get("/:id", getImageById);
router.put("/:id", protect, updateImage);
router.delete("/:id", protect, deleteImage);

export default router;
