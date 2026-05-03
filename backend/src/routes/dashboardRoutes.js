import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dashboard data is private because it is based on the logged-in user's projects.
router.get('/', protect, getDashboard);

export default router;
