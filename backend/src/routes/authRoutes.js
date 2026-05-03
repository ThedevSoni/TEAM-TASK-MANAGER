import express from 'express';
import { login, me, signup } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, signupSchema } from '../validators/schemas.js';

const router = express.Router();

// Public auth routes validate input before reaching controller logic.
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

// Private route returns the currently logged-in user's profile.
router.get('/me', protect, me);

export default router;
