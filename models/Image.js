import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    date: { type: Date, default: Date.now }, // date the photo was taken / should be credited
    tags: { type: [String], default: [], index: true },
    keywords: { type: [String], default: [] },

    // Cloudinary
    imageUrl: { type: String, required: true }, // secure_url, optimized delivery URL
    thumbnailUrl: { type: String, required: true }, // small transformed variant for cards
    publicId: { type: String, required: true, unique: true },

    // Dimensions / metadata detected on upload
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    aspectRatio: { type: Number, required: true }, // width / height
    orientation: {
      type: String,
      enum: ["landscape", "portrait", "square", "ultrawide", "tall"],
      required: true,
    },
    format: { type: String, required: true },
    fileSize: { type: Number, required: true }, // bytes
    altText: { type: String, default: "" },

    featured: { type: Boolean, default: false },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
  },
  { timestamps: true }
);

// Text index powers the /search endpoint (title, description, tags, keywords)
imageSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  keywords: "text",
});

export default mongoose.model("Image", imageSchema);
