import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Protects private routes by requiring a valid Bearer token.
export const protect = asyncHandler(async (req, _res, next) => {
  // Read the Authorization header sent by the frontend API client.
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication token required');
  }

  // Verify the JWT and load the matching user from MongoDB.
  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  // Attach the logged-in user so later controllers can make permission checks.
  req.user = user;
  next();
});

// Allows only users with one of the listed roles to continue.
export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to perform this action');
  }

  next();
};
