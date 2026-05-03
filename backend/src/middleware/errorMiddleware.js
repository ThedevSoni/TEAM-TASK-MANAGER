import ApiError from '../utils/ApiError.js';

// Builds a 404 error when no route matched the request.
export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

// Converts all thrown errors into consistent JSON responses for the frontend.
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  // Mongoose throws CastError when an invalid MongoDB id reaches a query.
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource id' });
  }

  // Duplicate key errors are usually duplicate email signup attempts.
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  // Mongoose schema validation errors are flattened into one readable message.
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(err.errors).map((item) => item.message).join(', ')
    });
  }

  // Default response for ApiError and unexpected server errors.
  res.status(statusCode).json({
    message: err.message || 'Internal server error'
  });
};
