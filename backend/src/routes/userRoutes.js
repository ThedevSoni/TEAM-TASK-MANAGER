import express from 'express';
import { getUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// The frontend uses this list to populate member and assignee dropdowns.
router.get('/', protect, getUsers);

export default router;
