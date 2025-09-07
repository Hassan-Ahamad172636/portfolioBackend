import express from 'express';
import { getDashboardAnalytics } from '../controllers/dashboard.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';

const router = express.Router();

// Admin-only dashboard analytics
router.get('/analytics', protect, getDashboardAnalytics);

export default router;