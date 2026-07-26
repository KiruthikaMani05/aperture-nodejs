import cloudinary from "../config/cloudinary.js";

/**
 * Streams a file buffer up to Cloudinary and resolves with the upload result,
 * which includes secure_url, public_id, width, height, format, bytes, etc.
 */
export const uploadBufferToCloudinary = (buffer, folder = "aperture") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        // Automatic quality + format selection at delivery time
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Builds a small, fast-loading thumbnail URL from a Cloudinary public_id
 * using on-the-fly transformations (used for gallery cards).
 */
export const buildThumbnailUrl = (publicId, width = 600) => {
  return cloudinary.url(publicId, {
    width,
    crop: "limit",
    quality: "auto",
    fetch_format: "auto",
  });
};

/**
 * Classifies an image's orientation from its raw pixel dimensions, used to
 * decide how the masonry grid should span the tile.
 */
export const classifyOrientation = (width, height) => {
  const ratio = width / height;
  if (ratio >= 2.2) return "ultrawide";
  if (ratio > 1.15) return "landscape";
  if (ratio >= 0.85) return "square";
  if (ratio > 0.45) return "portrait";
  return "tall";
};
