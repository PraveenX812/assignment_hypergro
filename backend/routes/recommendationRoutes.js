import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  recommendProperty,
  getReceivedRecommendations,
  searchUsers
} from '../controllers/recommendationController.js';

const router = express.Router();

router.use(protect);
router.post('/', recommendProperty);
router.get('/received', getReceivedRecommendations);
router.get('/search-users', searchUsers);

export default router;
