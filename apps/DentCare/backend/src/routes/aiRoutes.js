import express from 'express';
import {
  chat,
  getConversation,
  clearConversation,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/chat', chat);
router.get('/conversation', getConversation);
router.delete('/conversation', clearConversation);

export default router;