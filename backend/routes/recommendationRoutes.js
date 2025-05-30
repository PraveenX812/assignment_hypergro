import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  recommendProperty,
  getReceivedRecommendations,
  searchUsers
} from '../controllers/recommendationController.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Recommend a property to another user
router.post('/', recommendProperty);

// Get recommendations received by the logged-in user
router.get('/received', getReceivedRecommendations);

// Search for users to recommend properties to
router.get('/search-users', searchUsers);

export default router;
