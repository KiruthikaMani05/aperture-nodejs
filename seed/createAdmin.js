import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";
import mongoose from "mongoose";

dotenv.config();

const run = async () => {
  await connectDB();

  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script.");
    process.exit(1);
  }

  const existing = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists for ${ADMIN_EMAIL}`);
    process.exit(0);
  }

  await Admin.create({
    name: ADMIN_NAME || "Site Admin",
    email: ADMIN_EMAIL.toLowerCase(),
    password: ADMIN_PASSWORD,
  });

  console.log(`Admin account created for ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
  process.exit(0);
};

run();
