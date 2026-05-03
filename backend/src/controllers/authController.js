import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';

// Shared response format used after signup and login.
const authResponse = (user) => ({
  token: signToken(user),
  user: user.toJSON()
});

// Creates a new user account and immediately returns a login token.
export const signup = asyncHandler(async (req, res) => {
  // The validate middleware has already cleaned these fields.
  const { name, email, password, role } = req.body;
  const existingUser = await User.findOne({ email });

  // Prevent two accounts from using the same email address.
  if (existingUser) {
    throw new ApiError(409, 'Email already exists');
  }

  // Store only the hashed password, never the plain password.
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role
  });

  res.status(201).json(authResponse(user));
});

// Checks credentials and returns a fresh token for an existing user.
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Password is hidden by default, so select('+password') is needed for login.
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json(authResponse(user));
});

// Returns the current authenticated user loaded by protect middleware.
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
