import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getSeriesHistory, getSeriesDetails } from '../controllers/historyController';

const router = Router();

// Get series history for current user
router.get('/history', authMiddleware, getSeriesHistory);

// Get detailed series information
router.get('/history/:seriesId', authMiddleware, getSeriesDetails);

export default router;
