import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// Returns users for member assignment dropdowns.
export const getUsers = asyncHandler(async (_req, res) => {
  // Only expose the fields the frontend needs.
  const users = await User.find().sort({ name: 1 }).select('name email role');
  res.json(users);
});
