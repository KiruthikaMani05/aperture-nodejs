import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { deleteFromCloudinary } from "../utils/cloudinaryHelpers.js";

const router = Router();

// Direct Cloudinary asset delete, useful for cleaning up orphaned uploads
// that never got saved as an Image document.
router.delete("/:publicId", protect, async (req, res, next) => {
  try {
    const result = await deleteFromCloudinary(decodeURIComponent(req.params.publicId));
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

export default router;
