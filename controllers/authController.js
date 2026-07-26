import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(admin._id);
    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    next(error);
  }
};

// Stateless JWT — logout is handled client-side by discarding the token.
// Endpoint kept for a consistent API surface and to allow future
// token-blacklisting if needed.
export const logout = async (req, res) => {
  res.json({ message: "Logged out" });
};

export const me = async (req, res) => {
  res.json({ admin: req.admin });
};
