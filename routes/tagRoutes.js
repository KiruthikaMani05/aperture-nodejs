import { Router } from "express";
import { getTags } from "../controllers/imageController.js";

const router = Router();

router.get("/", getTags);

export default router;
