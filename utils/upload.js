import multer from "multer";

// Memory storage: we stream the buffer straight to Cloudinary, no need to
// touch disk. Limits keep the API from being used to upload arbitrary files.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Use JPEG, PNG, WEBP, AVIF or GIF."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});
