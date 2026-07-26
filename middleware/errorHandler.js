export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
