import Image from "../models/Image.js";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  buildThumbnailUrl,
  classifyOrientation,
} from "../utils/cloudinaryHelpers.js";

const parseList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => v.trim()).filter(Boolean);
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

// GET /api/images  (public gallery, paginated)
export const getImages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const query = { visibility: "public" };
    if (req.query.featured === "true") query.featured = true;

    const [images, total] = await Promise.all([
      Image.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Image.countDocuments(query),
    ]);

    res.json({
      images,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/images/:id
export const getImageById = async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });
    res.json({ image });
  } catch (error) {
    next(error);
  }
};

// GET /api/images/search?q=...
export const searchImages = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ images: [] });

    const regex = new RegExp(q, "i");
    const images = await Image.find({
      visibility: "public",
      $or: [{ title: regex }, { description: regex }, { tags: regex }, { keywords: regex }],
    }).sort({ createdAt: -1 });

    res.json({ images });
  } catch (error) {
    next(error);
  }
};

// GET /api/images/filter?tag=&year=&month=&sort=newest|oldest
export const filterImages = async (req, res, next) => {
  try {
    const { tag, year, month, sort } = req.query;
    const query = { visibility: "public" };

    if (tag) query.tags = tag;

    if (year || month) {
      const y = year ? parseInt(year) : new Date().getFullYear();
      const start = new Date(y, month ? parseInt(month) - 1 : 0, 1);
      const end = month ? new Date(y, parseInt(month), 1) : new Date(y + 1, 0, 1);
      query.date = { $gte: start, $lt: end };
    }

    const images = await Image.find(query).sort({ date: sort === "oldest" ? 1 : -1 });
    res.json({ images });
  } catch (error) {
    next(error);
  }
};

// GET /api/tags — distinct tag list with counts, for the filter UI
export const getTags = async (req, res, next) => {
  try {
    const tags = await Image.aggregate([
      { $match: { visibility: "public" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ tags: tags.map((t) => ({ tag: t._id, count: t.count })) });
  } catch (error) {
    next(error);
  }
};

// POST /api/images  (admin, multipart/form-data with "image" file field)
export const createImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "An image file is required" });

    const result = await uploadBufferToCloudinary(req.file.buffer);
    const orientation = classifyOrientation(result.width, result.height);

    const image = await Image.create({
      title: req.body.title,
      description: req.body.description || "",
      date: req.body.date || Date.now(),
      tags: parseList(req.body.tags),
      keywords: parseList(req.body.keywords),
      altText: req.body.altText || req.body.title,
      featured: req.body.featured === "true" || req.body.featured === true,
      visibility: req.body.visibility === "private" ? "private" : "public",

      imageUrl: result.secure_url,
      thumbnailUrl: buildThumbnailUrl(result.public_id),
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      aspectRatio: +(result.width / result.height).toFixed(4),
      orientation,
      format: result.format,
      fileSize: result.bytes,
    });

    res.status(201).json({ image });
  } catch (error) {
    next(error);
  }
};

// PUT /api/images/:id  (admin, metadata only — swap image via delete+re-upload)
export const updateImage = async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    const fields = ["title", "description", "date", "altText", "visibility"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) image[f] = req.body[f];
    });
    if (req.body.tags !== undefined) image.tags = parseList(req.body.tags);
    if (req.body.keywords !== undefined) image.keywords = parseList(req.body.keywords);
    if (req.body.featured !== undefined) image.featured = req.body.featured === "true" || req.body.featured === true;

    await image.save();
    res.json({ image });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/images/:id  (admin)
export const deleteImage = async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    await deleteFromCloudinary(image.publicId);
    await image.deleteOne();

    res.json({ message: "Image deleted" });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/images  (admin, bulk) — body: { ids: [...] }
export const bulkDeleteImages = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids array is required" });
    }

    const images = await Image.find({ _id: { $in: ids } });
    await Promise.all(images.map((img) => deleteFromCloudinary(img.publicId)));
    await Image.deleteMany({ _id: { $in: ids } });

    res.json({ message: `${images.length} image(s) deleted` });
  } catch (error) {
    next(error);
  }
};

// GET /api/images/admin/all  (admin — includes private images, for dashboard)
export const getAllImagesAdmin = async (req, res, next) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json({ images });
  } catch (error) {
    next(error);
  }
};

// GET /api/images/admin/stats
export const getStats = async (req, res, next) => {
  try {
    const [total, publicCount, privateCount, featuredCount, storageAgg] = await Promise.all([
      Image.countDocuments(),
      Image.countDocuments({ visibility: "public" }),
      Image.countDocuments({ visibility: "private" }),
      Image.countDocuments({ featured: true }),
      Image.aggregate([{ $group: { _id: null, bytes: { $sum: "$fileSize" } } }]),
    ]);

    res.json({
      total,
      public: publicCount,
      private: privateCount,
      featured: featuredCount,
      totalStorageBytes: storageAgg[0]?.bytes || 0,
    });
  } catch (error) {
    next(error);
  }
};
