import jwt from 'jsonwebtoken';

// Creates a signed JWT containing the user's id and role for later authentication.
export const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
