import "./loadEnv.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import cloudinaryRoutes from "./routes/cloudinaryRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
connectDB();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Basic rate limiting across the API; tighter limit on auth to slow brute force
app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
